import { getMemberById, getMembersByIds } from "@/lib/members";
import {
  getMemberActivityMilestones,
  memberActivityMilestonesToFeedItems,
} from "@/lib/members/initial-activities";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { MemberActivityFeedItem, MemberActivityKind } from "@/types/activity";
import type { BandActivityKind, BandTimelineKind } from "@/types/band";
import type { Member } from "@/types/member";

const TIMELINE_COLUMNS =
  "id,band_id,kind,title,body,occurred_at,activity_id" as const;

function readBandMeta(bands: unknown): { name: string; createdByMemberId?: string } {
  const row = Array.isArray(bands) ? bands[0] : bands;
  if (!row || typeof row !== "object") {
    return { name: "Band" };
  }

  const band = row as { name?: string; created_by_member_id?: string };
  return {
    name: band.name ?? "Band",
    createdByMemberId: band.created_by_member_id,
  };
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

function buildResonanceItems(
  outgoing: { to_member_id: string; created_at: string }[],
  incoming: { from_member_id: string; created_at: string }[],
  partnerMap: Map<string, Member>
): MemberActivityFeedItem[] {
  const incomingMap = new Map(incoming.map((row) => [row.from_member_id, row.created_at]));
  const outgoingPartnerIds = new Set(outgoing.map((row) => row.to_member_id));
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

  for (const row of incoming) {
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

  return items;
}

/** My Page: only the viewer's own actions and milestones. */
export async function getOwnMemberActivityFeed(
  memberId: string,
  limit = 40,
  memberName?: string
): Promise<MemberActivityFeedItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const [{ data: memberMeta }, member] = await Promise.all([
    supabase.from("members").select("created_at").eq("id", memberId).maybeSingle(),
    getMemberById(memberId),
  ]);
  const viewerName = memberName ?? member?.name;
  const registeredAt = memberMeta?.created_at;

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
            .select(`${TIMELINE_COLUMNS}, bands(name, created_by_member_id)`)
            .in("band_id", bandIds)
            .order("occurred_at", { ascending: false })
            .limit(50)
        : Promise.resolve({ data: null, error: null }),
      bandIds.length > 0
        ? supabase
            .from("band_activities")
            .select("*, bands(name)")
            .eq("author_member_id", memberId)
            .in("band_id", bandIds)
            .order("created_at", { ascending: false })
            .limit(30)
        : Promise.resolve({ data: null, error: null }),
    ]);

  const outgoing = outgoingResult.data ?? [];
  const incoming = incomingResult.data ?? [];
  const partnerIds = new Set<string>();

  for (const row of outgoing) {
    partnerIds.add(row.to_member_id);
  }
  for (const row of incoming) {
    partnerIds.add(row.from_member_id);
  }

  const partnerMap = await getMembersByIds([...partnerIds]);
  const items = [
    ...memberActivityMilestonesToFeedItems(
      getMemberActivityMilestones(member, registeredAt)
    ),
    ...buildResonanceItems(outgoing, incoming, partnerMap),
  ];

  for (const row of timelineResult.data ?? []) {
    if (row.kind === "activity" || row.kind === "first_resonance") {
      continue;
    }

    const { name: bandName, createdByMemberId } = readBandMeta(row.bands);

    if (row.kind === "band_formed") {
      if (createdByMemberId !== memberId) {
        continue;
      }
    } else if (row.kind === "member_joined") {
      const body = row.body ? String(row.body) : "";
      if (!viewerName || !body.includes(viewerName)) {
        continue;
      }
    } else {
      continue;
    }

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
    const bandName = readBandMeta(row.bands).name;
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

  const outgoing = outgoingResult.data ?? [];
  const incoming = incomingResult.data ?? [];
  const partnerIds = new Set<string>();

  for (const row of outgoing) {
    partnerIds.add(row.to_member_id);
  }
  for (const row of incoming) {
    partnerIds.add(row.from_member_id);
  }

  const partnerMap = await getMembersByIds([...partnerIds]);
  const items = buildResonanceItems(outgoing, incoming, partnerMap);

  for (const row of timelineResult.data ?? []) {
    if (row.kind === "activity" || row.kind === "first_resonance") {
      continue;
    }

    const bandName = readBandMeta(row.bands).name;
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
    const bandName = readBandMeta(row.bands).name;
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
