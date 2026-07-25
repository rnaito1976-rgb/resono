import { getMembersByIds } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { MemberActivityFeedItem, MemberActivityKind } from "@/types/activity";
import type { BandActivityKind, BandTimelineKind } from "@/types/band";

const TIMELINE_COLUMNS =
  "id,band_id,kind,title,body,occurred_at,activity_id" as const;

function readBandName(bands: unknown): string {
  if (Array.isArray(bands)) {
    const first = bands[0] as { name?: string } | undefined;
    return first?.name ?? "Band";
  }

  if (bands && typeof bands === "object" && "name" in bands) {
    return String((bands as { name: string }).name);
  }

  return "Band";
}

function mapTimelineKind(kind: string): MemberActivityKind {
  if (kind === "band_formed") {
    return "band_formed";
  }
  if (kind === "member_joined") {
    return "member_joined";
  }
  return "timeline";
}

export async function getMemberActivityFeed(
  memberId: string,
  limit = 40
): Promise<MemberActivityFeedItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("band_members")
    .select("band_id")
    .eq("member_id", memberId);

  const bandIds = (memberships ?? []).map((row) => row.band_id);

  const [outgoingResult, incomingResult, timelineResult, activitiesResult] =
    await Promise.all([
      supabase
        .from("resonances")
        .select("to_member_id, created_at")
        .eq("from_member_id", memberId),
      supabase
        .from("resonances")
        .select("from_member_id, created_at")
        .eq("to_member_id", memberId),
      bandIds.length > 0
        ? supabase
            .from("band_timeline_events")
            .select(`${TIMELINE_COLUMNS}, bands(name)`)
            .in("band_id", bandIds)
            .order("occurred_at", { ascending: false })
            .limit(50)
        : Promise.resolve({ data: null, error: null }),
      bandIds.length > 0
        ? supabase
            .from("band_activities")
            .select("*, bands(name)")
            .in("band_id", bandIds)
            .order("created_at", { ascending: false })
            .limit(30)
        : Promise.resolve({ data: null, error: null }),
    ]);

  const incomingMap = new Map(
    (incomingResult.data ?? []).map((row) => [row.from_member_id, row.created_at])
  );
  const outgoing = outgoingResult.data ?? [];
  const outgoingPartnerIds = new Set(outgoing.map((row) => row.to_member_id));

  const partnerIds = new Set<string>();
  for (const row of outgoing) {
    partnerIds.add(row.to_member_id);
  }
  for (const row of incomingResult.data ?? []) {
    partnerIds.add(row.from_member_id);
  }

  const partnerMap = await getMembersByIds([...partnerIds]);
  const items: MemberActivityFeedItem[] = [];

  for (const row of outgoing) {
    const partner = partnerMap.get(row.to_member_id);
    if (!partner) {
      continue;
    }

    const incomingAt = incomingMap.get(row.to_member_id);
    if (incomingAt) {
      const occurredAt = incomingAt > row.created_at ? incomingAt : row.created_at;
      items.push({
        id: `mutual-${row.to_member_id}`,
        kind: "mutual_resonance",
        occurredAt,
        title: `${partner.name}さんと共鳴`,
        body: "お互いに共鳴しました。",
        partnerMember: partner,
      });
    } else {
      items.push({
        id: `resonance-${row.to_member_id}`,
        kind: "resonance_sent",
        occurredAt: row.created_at,
        title: `${partner.name}さんに共鳴`,
        body: "共鳴を送りました。",
        partnerMember: partner,
      });
    }
  }

  for (const row of incomingResult.data ?? []) {
    if (outgoingPartnerIds.has(row.from_member_id)) {
      continue;
    }

    const partner = partnerMap.get(row.from_member_id);
    if (!partner) {
      continue;
    }

    items.push({
      id: `received-${row.from_member_id}`,
      kind: "resonance_received",
      occurredAt: row.created_at,
      title: `${partner.name}さんから共鳴`,
      body: "あなたに共鳴が届きました。",
      partnerMember: partner,
    });
  }

  for (const row of timelineResult.data ?? []) {
    if (row.kind === "activity" || row.kind === "first_resonance") {
      continue;
    }

    const bandName = readBandName(row.bands);
    items.push({
      id: `timeline-${row.id}`,
      kind: mapTimelineKind(String(row.kind)),
      occurredAt: String(row.occurred_at),
      title: String(row.title),
      body: row.body ? String(row.body) : undefined,
      bandId: String(row.band_id),
      bandName,
      timelineKind: row.kind as BandTimelineKind,
    });
  }

  for (const row of activitiesResult.data ?? []) {
    const bandName = readBandName(row.bands);
    items.push({
      id: `activity-${row.id}`,
      kind: "band_post",
      occurredAt: String(row.created_at),
      title: bandName,
      body: row.body ? String(row.body) : row.title ? String(row.title) : undefined,
      bandId: String(row.band_id),
      bandName,
      mediaUrl: row.media_url ? String(row.media_url) : undefined,
      activityKind: row.kind as BandActivityKind,
    });
  }

  items.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  return items.slice(0, limit);
}
