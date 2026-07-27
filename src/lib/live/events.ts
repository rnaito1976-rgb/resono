import { createAdminClient } from "@/lib/supabase/admin";
import { createAnonClient } from "@/lib/supabase/anon";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isLiveEventNew } from "@/lib/live/time";
import {
  LIVE_EVENT_WINDOW_MS,
  type LiveEvent,
  type LiveEventKind,
} from "@/types/live";

export type PublishLiveEventInput = {
  kind: LiveEventKind;
  title: string;
  subtitle?: string;
  href: string;
  photo?: string;
  actorMemberId?: string;
  bandId?: string;
};

type LiveEventRow = {
  id: string;
  kind: string;
  title: string;
  subtitle: string | null;
  href: string;
  photo: string | null;
  actor_member_id: string | null;
  band_id: string | null;
  created_at: string;
};

const LIVE_KINDS = new Set<LiveEventKind>([
  "new_member",
  "new_band",
  "band_formed",
  "new_video",
  "looking_for_updated",
]);

function rowToLiveEvent(row: LiveEventRow, now = Date.now()): LiveEvent | null {
  if (!LIVE_KINDS.has(row.kind as LiveEventKind)) {
    return null;
  }

  return {
    id: row.id,
    kind: row.kind as LiveEventKind,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    href: row.href,
    photo: row.photo ?? undefined,
    actorMemberId: row.actor_member_id ?? undefined,
    bandId: row.band_id ?? undefined,
    createdAt: row.created_at,
    isNew: isLiveEventNew(row.created_at, now),
  };
}

function sortAndLimit(events: LiveEvent[], limit: number, now = Date.now()): LiveEvent[] {
  return [...events]
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit)
    .map((event) => ({
      ...event,
      isNew: isLiveEventNew(event.createdAt, now),
    }));
}

/** Fire-and-forget community Live event. Never throws to callers. */
export async function publishLiveEvent(input: PublishLiveEventInput): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("live_events").insert({
      kind: input.kind,
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() || null,
      href: input.href,
      photo: input.photo?.trim() || null,
      actor_member_id: input.actorMemberId ?? null,
      band_id: input.bandId ?? null,
    });

    if (error) {
      console.error("[Live] publishLiveEvent:", error.message);
    }
  } catch (error) {
    console.error("[Live] publishLiveEvent:", error);
  }
}

async function getStoredLiveEvents(since: string, limit: number): Promise<LiveEvent[]> {
  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("live_events")
      .select(
        "id, kind, title, subtitle, href, photo, actor_member_id, band_id, created_at"
      )
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      // Table may not exist yet before migration 021 is applied.
      console.error("[Live] getStoredLiveEvents:", error.message);
      return [];
    }

    const now = Date.now();
    return (data as LiveEventRow[] | null)
      ?.map((row) => rowToLiveEvent(row, now))
      .filter((item): item is LiveEvent => item != null) ?? [];
  } catch (error) {
    console.error("[Live] getStoredLiveEvents:", error);
    return [];
  }
}

/** Derive Live cards from public members + bands when the events table is empty. */
async function synthesizeLiveEvents(since: string, limit: number): Promise<LiveEvent[]> {
  const events: LiveEvent[] = [];
  const anon = createAnonClient();
  const admin = createAdminClient();
  const reader = admin ?? anon;

  try {
    const { data: members, error: membersError } = await anon
      .from("members")
      .select("id, name, photo, portrait, user_id, created_at")
      .not("user_id", "is", null)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (membersError) {
      console.error("[Live] synthesize members:", membersError.message);
    } else {
      for (const row of members ?? []) {
        const portrait = row.portrait as { dialogueCompleted?: boolean } | null;
        if (portrait?.dialogueCompleted !== true) {
          continue;
        }

        events.push({
          id: `synth-member-${row.id}`,
          kind: "new_member",
          title: row.name,
          subtitle: "コミュニティに参加しました",
          href: `/member/${row.id}`,
          photo: row.photo || undefined,
          actorMemberId: row.id,
          createdAt: row.created_at,
          isNew: false,
        });
      }
    }
    // If nothing happened in 24h, still show a few recent members so Live isn't blank.
    if (events.length === 0) {
      const { data: recentMembers } = await anon
        .from("members")
        .select("id, name, photo, portrait, user_id, created_at")
        .not("user_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(8);

      for (const row of recentMembers ?? []) {
        const portrait = row.portrait as { dialogueCompleted?: boolean } | null;
        if (portrait?.dialogueCompleted !== true) {
          continue;
        }

        events.push({
          id: `synth-member-${row.id}`,
          kind: "new_member",
          title: row.name,
          subtitle: "コミュニティに参加しました",
          href: `/member/${row.id}`,
          photo: row.photo || undefined,
          actorMemberId: row.id,
          createdAt: row.created_at,
          isNew: false,
        });
      }
    }
  } catch (error) {
    console.error("[Live] synthesize members:", error);
  }

  try {
    const { data: bands, error: bandsError } = await reader
      .from("bands")
      .select("id, name, created_at, created_by_member_id")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (bandsError) {
      console.error("[Live] synthesize bands:", bandsError.message);
    } else {
      for (const row of bands ?? []) {
        events.push({
          id: `synth-band-${row.id}`,
          kind: "band_formed",
          title: row.name,
          subtitle: "新しいBandが始まりました",
          href: `/bands/${row.id}`,
          actorMemberId: row.created_by_member_id,
          bandId: row.id,
          createdAt: row.created_at,
          isNew: false,
        });
      }
    }
  } catch (error) {
    console.error("[Live] synthesize bands:", error);
  }

  try {
    const { data: videos, error: videosError } = await reader
      .from("band_activities")
      .select("id, band_id, title, body, media_url, created_at")
      .eq("kind", "video")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (videosError) {
      console.error("[Live] synthesize videos:", videosError.message);
    } else if (videos && videos.length > 0) {
      const bandIds = [...new Set(videos.map((video) => video.band_id))];
      const { data: bandRows } = await reader
        .from("bands")
        .select("id, name")
        .in("id", bandIds);
      const bandNames = new Map(
        (bandRows ?? []).map((band) => [band.id, band.name] as const)
      );

      for (const row of videos) {
        events.push({
          id: `synth-video-${row.id}`,
          kind: "new_video",
          title: bandNames.get(row.band_id) ?? "Band",
          subtitle: row.title?.trim() || row.body?.trim() || "演奏動画を追加",
          href: `/bands/${row.band_id}`,
          photo: row.media_url || undefined,
          bandId: row.band_id,
          createdAt: row.created_at,
          isNew: false,
        });
      }
    }
  } catch (error) {
    console.error("[Live] synthesize videos:", error);
  }

  return events;
}

export async function getLiveEvents(limit = 24): Promise<LiveEvent[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const since = new Date(Date.now() - LIVE_EVENT_WINDOW_MS).toISOString();
  const now = Date.now();

  try {
    const [stored, synthesized] = await Promise.all([
      getStoredLiveEvents(since, limit),
      synthesizeLiveEvents(since, limit),
    ]);

    const seen = new Set<string>();
    const merged: LiveEvent[] = [];

    for (const event of [...stored, ...synthesized]) {
      // Prefer stored events; skip synth duplicates for the same member/band/video.
      const dedupeKey =
        event.kind === "new_member" && event.actorMemberId
          ? `member:${event.actorMemberId}`
          : event.bandId
            ? `${event.kind}:${event.bandId}`
            : event.id;

      if (seen.has(dedupeKey)) {
        continue;
      }

      seen.add(dedupeKey);
      merged.push(event);
    }

    return sortAndLimit(merged, limit, now);
  } catch (error) {
    console.error("[Live] getLiveEvents:", error);
    return [];
  }
}
