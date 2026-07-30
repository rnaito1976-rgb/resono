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
    const admin = createAdminClient();
    const supabase = admin ?? (await createClient());
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
      return;
    }

    clearLiveEventsCache();
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

/** Derive new-member Live cards from members (always run as a fallback). */
async function synthesizeMemberLiveEvents(
  since: string,
  limit: number,
  now = Date.now()
): Promise<LiveEvent[]> {
  const events: LiveEvent[] = [];
  const anon = createAnonClient();

  const MEMBER_SYNTH_COLUMNS =
    "id, name, photo, created_at, dialogue_completed:portrait->dialogueCompleted, joined_at:portrait->activityMilestones->0->>occurredAt";

  type MemberSynthRow = {
    id: string;
    name: string;
    photo: string | null;
    created_at: string;
    dialogue_completed: boolean | null;
    joined_at: string | null;
  };

  function pushMemberEvents(rows: MemberSynthRow[]) {
    for (const row of rows) {
      if (row.dialogue_completed !== true) {
        continue;
      }

      const joinedAt = row.joined_at?.trim() || row.created_at;

      events.push({
        id: `synth-member-${row.id}`,
        kind: "new_member",
        title: row.name,
        subtitle: "コミュニティに参加しました",
        href: `/member/${row.id}`,
        photo: row.photo || undefined,
        actorMemberId: row.id,
        createdAt: joinedAt,
        isNew: isLiveEventNew(joinedAt, now),
      });
    }
  }

  try {
    const { data: members, error: membersError } = await anon
      .from("members")
      .select(MEMBER_SYNTH_COLUMNS)
      .not("user_id", "is", null)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (membersError) {
      console.error("[Live] synthesize members:", membersError.message);
    } else {
      pushMemberEvents((members ?? []) as unknown as MemberSynthRow[]);
    }

    if (events.length === 0) {
      const { data: recentMembers } = await anon
        .from("members")
        .select(MEMBER_SYNTH_COLUMNS)
        .not("user_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(8);

      pushMemberEvents((recentMembers ?? []) as unknown as MemberSynthRow[]);
    }
  } catch (error) {
    console.error("[Live] synthesize members:", error);
  }

  return events;
}

/** Derive band/video Live cards when stored events are sparse. */
async function synthesizeBandLiveEvents(
  since: string,
  limit: number,
  now = Date.now()
): Promise<LiveEvent[]> {
  const events: LiveEvent[] = [];
  const anon = createAnonClient();
  const admin = createAdminClient();
  const reader = admin ?? anon;

  try {
    const [bandsResult, videosResult] = await Promise.all([
      reader
        .from("bands")
        .select("id, name, created_at, created_by_member_id")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(limit),
      reader
        .from("band_activities")
        .select("id, band_id, title, body, media_url, created_at")
        .eq("kind", "video")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(limit),
    ]);

    const bands = bandsResult.data;
    if (bandsResult.error) {
      console.error("[Live] synthesize bands:", bandsResult.error.message);
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
          isNew: isLiveEventNew(row.created_at, now),
        });
      }
    }

    const videos = videosResult.data;
    if (videosResult.error) {
      console.error("[Live] synthesize videos:", videosResult.error.message);
    } else if (videos && videos.length > 0) {
      const knownBandNames = new Map(
        (bands ?? []).map((band) => [band.id, band.name] as const)
      );
      const missingBandIds = [
        ...new Set(
          videos
            .map((video) => video.band_id)
            .filter((bandId) => !knownBandNames.has(bandId))
        ),
      ];

      if (missingBandIds.length > 0) {
        const { data: bandRows } = await reader
          .from("bands")
          .select("id, name")
          .in("id", missingBandIds);

        for (const band of bandRows ?? []) {
          knownBandNames.set(band.id, band.name);
        }
      }

      for (const row of videos) {
        events.push({
          id: `synth-video-${row.id}`,
          kind: "new_video",
          title: knownBandNames.get(row.band_id) ?? "Band",
          subtitle: row.title?.trim() || row.body?.trim() || "演奏動画を追加",
          href: `/bands/${row.band_id}`,
          photo: row.media_url || undefined,
          bandId: row.band_id,
          createdAt: row.created_at,
          isNew: isLiveEventNew(row.created_at, now),
        });
      }
    }
  } catch (error) {
    console.error("[Live] synthesize bands/videos:", error);
  }

  return events;
}

type LiveEventsCacheEntry = {
  expiresAt: number;
  events: LiveEvent[];
};

const LIVE_EVENTS_CACHE_TTL_MS = 30_000;
/** 合成にはメンバー・バンド・動画で4〜5クエリかかるので、常時は走らせない */
const SYNTHESIZE_THRESHOLD = 4;

let liveEventsCache: LiveEventsCacheEntry | null = null;

export function clearLiveEventsCache() {
  liveEventsCache = null;
}

export async function getLiveEvents(limit = 24): Promise<LiveEvent[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const now = Date.now();

  if (liveEventsCache && liveEventsCache.expiresAt > now) {
    return sortAndLimit(liveEventsCache.events, limit, now);
  }

  const since = new Date(now - LIVE_EVENT_WINDOW_MS).toISOString();

  try {
    const stored = await getStoredLiveEvents(since, limit);
    const [memberSynth, bandSynth] = await Promise.all([
      synthesizeMemberLiveEvents(since, limit, now),
      stored.length >= SYNTHESIZE_THRESHOLD
        ? Promise.resolve([])
        : synthesizeBandLiveEvents(since, limit, now),
    ]);
    const synthesized = [...memberSynth, ...bandSynth];

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

    liveEventsCache = {
      events: merged,
      expiresAt: now + LIVE_EVENTS_CACHE_TTL_MS,
    };

    return sortAndLimit(merged, limit, now);
  } catch (error) {
    console.error("[Live] getLiveEvents:", error);
    return [];
  }
}
