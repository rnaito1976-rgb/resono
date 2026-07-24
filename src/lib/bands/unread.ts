import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type BandUnreadSummary = {
  total: number;
  byBandId: Record<string, number>;
};

type TimelineEventRow = {
  id: string;
  band_id: string;
  occurred_at: string;
  activity_id: string | null;
};

function isUnreadTimelineEvent(
  event: TimelineEventRow,
  lastSeenAt: string | undefined,
  ownActivityIds: Set<string>
): boolean {
  if (lastSeenAt && event.occurred_at <= lastSeenAt) {
    return false;
  }

  if (event.activity_id && ownActivityIds.has(event.activity_id)) {
    return false;
  }

  return true;
}

export async function getBandUnreadSummaryForMember(
  memberId: string
): Promise<BandUnreadSummary> {
  if (!isSupabaseConfigured()) {
    return { total: 0, byBandId: {} };
  }

  const supabase = await createClient();
  const { data: memberships, error: membershipError } = await supabase
    .from("band_members")
    .select("band_id")
    .eq("member_id", memberId);

  if (membershipError) {
    console.error("[Supabase] getBandUnreadSummary memberships:", membershipError.message);
    return { total: 0, byBandId: {} };
  }

  const bandIds = (memberships ?? []).map((row) => row.band_id);
  if (bandIds.length === 0) {
    return { total: 0, byBandId: {} };
  }

  const [{ data: reads, error: readsError }, { data: events, error: eventsError }] =
    await Promise.all([
      supabase
        .from("band_member_reads")
        .select("band_id, last_seen_at")
        .eq("member_id", memberId)
        .in("band_id", bandIds),
      supabase
        .from("band_timeline_events")
        .select("id, band_id, occurred_at, activity_id")
        .in("band_id", bandIds),
    ]);

  if (readsError) {
    console.error("[Supabase] getBandUnreadSummary reads:", readsError.message);
  }

  if (eventsError) {
    console.error("[Supabase] getBandUnreadSummary events:", eventsError.message);
    return { total: 0, byBandId: {} };
  }

  const lastSeenByBand = new Map(
    (reads ?? []).map((row) => [row.band_id, row.last_seen_at])
  );
  const activityIds = (events ?? [])
    .map((event) => event.activity_id)
    .filter((activityId): activityId is string => Boolean(activityId));

  const ownActivityIds = new Set<string>();

  if (activityIds.length > 0) {
    const { data: activities, error: activitiesError } = await supabase
      .from("band_activities")
      .select("id")
      .in("id", activityIds)
      .eq("author_member_id", memberId);

    if (activitiesError) {
      console.error(
        "[Supabase] getBandUnreadSummary activities:",
        activitiesError.message
      );
    } else {
      for (const activity of activities ?? []) {
        ownActivityIds.add(activity.id);
      }
    }
  }

  const byBandId: Record<string, number> = {};
  let total = 0;

  for (const bandId of bandIds) {
    const unreadCount = (events ?? []).filter((event) =>
      event.band_id === bandId &&
      isUnreadTimelineEvent(
        event as TimelineEventRow,
        lastSeenByBand.get(bandId),
        ownActivityIds
      )
    ).length;

    if (unreadCount > 0) {
      byBandId[bandId] = unreadCount;
      total += unreadCount;
    }
  }

  return { total, byBandId };
}

export async function getBandUnreadCountForMember(memberId: string): Promise<number> {
  const summary = await getBandUnreadSummaryForMember(memberId);
  return summary.total;
}

export async function markBandAsSeen(
  bandId: string,
  memberId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("band_member_reads").upsert(
    {
      band_id: bandId,
      member_id: memberId,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "band_id,member_id" }
  );

  if (error) {
    console.error("[Supabase] markBandAsSeen:", error.message);
  }
}
