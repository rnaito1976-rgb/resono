import { getFrequencyColorsByUserIds } from "@/lib/frequency-color/server";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { getMemberById, getMembersByIds, getMemberByUserId } from "@/lib/members";
import { getConversationIdsForMemberPairs } from "@/lib/resonance/status";
import { calculateResonanceMatch } from "@/lib/resonance/matching";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  Band,
  BandActivity,
  BandActivityFeedItem,
  BandDetail,
  BandMember,
  BandTimelineEvent,
  MutualResonateMember,
} from "@/types/band";
import type { Member } from "@/types/member";

type BandRow = {
  id: string;
  name: string;
  accent_color: string | null;
  activity_status: Band["activityStatus"];
  created_by_member_id: string;
  created_at: string;
};

function rowToBand(row: BandRow): Band {
  return {
    id: row.id,
    name: row.name,
    accentColor: (row.accent_color as FrequencyColorHex | null) ?? undefined,
    activityStatus: row.activity_status,
    createdByMemberId: row.created_by_member_id,
    createdAt: row.created_at,
  };
}

export async function getBandsForMember(memberId: string): Promise<Band[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("band_members")
    .select("bands(*)")
    .eq("member_id", memberId)
    .order("joined_at", { ascending: false });

  if (error) {
    console.error("[Supabase] getBandsForMember:", error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => row.bands as unknown as BandRow | null)
    .filter((band): band is BandRow => Boolean(band))
    .map(rowToBand);
}

export async function getMutualResonateMembers(
  viewerMemberId: string
): Promise<MutualResonateMember[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const { data: outgoing, error: outgoingError } = await supabase
    .from("resonances")
    .select("to_member_id, created_at")
    .eq("from_member_id", viewerMemberId);

  if (outgoingError) {
    console.error("[Supabase] getMutualResonateMembers outgoing:", outgoingError.message);
    return [];
  }

  if (!outgoing?.length) {
    return [];
  }

  const targetIds = outgoing.map((row) => row.to_member_id);
  const { data: incoming, error: incomingError } = await supabase
    .from("resonances")
    .select("from_member_id")
    .eq("to_member_id", viewerMemberId)
    .in("from_member_id", targetIds);

  if (incomingError) {
    console.error("[Supabase] getMutualResonateMembers incoming:", incomingError.message);
    return [];
  }

  const incomingSet = new Set((incoming ?? []).map((row) => row.from_member_id));
  const mutualRows = outgoing.filter((row) => incomingSet.has(row.to_member_id));

  if (mutualRows.length === 0) {
    return [];
  }

  const mutualIds = mutualRows.map((row) => row.to_member_id);
  const [memberMap, conversationMap] = await Promise.all([
    getMembersByIds(mutualIds),
    getConversationIdsForMemberPairs(viewerMemberId, mutualIds),
  ]);

  const results = mutualRows
    .map((row) => {
      const member = memberMap.get(row.to_member_id);
      if (!member) {
        return null;
      }

      return {
        member,
        resonatedAt: row.created_at,
        conversationId: conversationMap.get(row.to_member_id) ?? undefined,
      } satisfies MutualResonateMember;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const userIds = results
    .map((item) => item.member.userId)
    .filter((userId): userId is string => Boolean(userId));
  const colorMap = await getFrequencyColorsByUserIds(userIds);

  return results.map((item) => ({
    ...item,
    frequencyColor: item.member.userId
      ? colorMap.get(item.member.userId)
      : undefined,
  }));
}

async function loadBandMembers(
  bandId: string,
  viewer?: Member
): Promise<BandMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("band_members")
    .select("band_id, member_id, joined_at")
    .eq("band_id", bandId)
    .order("joined_at", { ascending: true });

  if (error) {
    console.error("[Supabase] loadBandMembers:", error.message);
    return [];
  }

  const memberIds = (data ?? []).map((row) => row.member_id);
  const memberMap = await getMembersByIds(memberIds);
  const otherMemberIds =
    viewer != null
      ? memberIds.filter((memberId) => memberId !== viewer.id)
      : [];
  let resonanceMap = new Map<string, string>();

  if (viewer && otherMemberIds.length > 0) {
    const { data: outgoing } = await supabase
      .from("resonances")
      .select("to_member_id, created_at")
      .eq("from_member_id", viewer.id)
      .in("to_member_id", otherMemberIds);

    resonanceMap = new Map(
      (outgoing ?? []).map((row) => [row.to_member_id, row.created_at])
    );
  }

  const members = (data ?? [])
    .map((row) => {
      const member = memberMap.get(row.member_id);
      if (!member) {
        return null;
      }

      let resonatedAt: string | undefined;
      if (viewer && viewer.id !== member.id) {
        resonatedAt = resonanceMap.get(member.id);
      }

      return {
        bandId: row.band_id,
        memberId: row.member_id,
        joinedAt: row.joined_at,
        member,
        resonatedAt,
        resonanceScore:
          viewer && viewer.id !== member.id
            ? calculateResonanceMatch(viewer, member)
            : undefined,
      } satisfies BandMember;
    })
    .filter(Boolean) as BandMember[];

  const userIds = members
    .map((item) => item.member.userId)
    .filter((userId): userId is string => Boolean(userId));
  const colorMap = await getFrequencyColorsByUserIds(userIds);

  return members.map((item) => ({
    ...item,
    frequencyColor: item.member.userId
      ? colorMap.get(item.member.userId)
      : undefined,
  }));
}

export async function getBandDetail(
  bandId: string,
  viewerMemberId: string
): Promise<BandDetail | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const viewer = await getMemberById(viewerMemberId);

  const { data: bandRow, error: bandError } = await supabase
    .from("bands")
    .select("*")
    .eq("id", bandId)
    .maybeSingle();

  if (bandError || !bandRow) {
    return null;
  }

  const { data: membership } = await supabase
    .from("band_members")
    .select("member_id")
    .eq("band_id", bandId)
    .eq("member_id", viewerMemberId)
    .maybeSingle();

  if (!membership) {
    return null;
  }

  const [members, timelineResult, activitiesResult] = await Promise.all([
    loadBandMembers(bandId, viewer ?? undefined),
    supabase
      .from("band_timeline_events")
      .select("*")
      .eq("band_id", bandId)
      .order("occurred_at", { ascending: false }),
    supabase
      .from("band_activities")
      .select("*")
      .eq("band_id", bandId)
      .order("created_at", { ascending: false }),
  ]);

  const timeline = (timelineResult.data ?? []).map(
    (row): BandTimelineEvent => ({
      id: row.id,
      bandId: row.band_id,
      kind: row.kind as BandTimelineEvent["kind"],
      title: row.title,
      body: row.body ?? undefined,
      occurredAt: row.occurred_at,
      activityId: row.activity_id ?? undefined,
    })
  );

  const authorIds = [
    ...new Set((activitiesResult.data ?? []).map((row) => row.author_member_id)),
  ];
  const authorMap = await getMembersByIds(authorIds);
  const activities = (activitiesResult.data ?? []).map((row): BandActivity => ({
    id: row.id,
    bandId: row.band_id,
    authorMemberId: row.author_member_id,
    kind: row.kind as BandActivity["kind"],
    title: row.title ?? undefined,
    body: row.body ?? undefined,
    mediaUrl: row.media_url ?? undefined,
    createdAt: row.created_at,
    author: authorMap.get(row.author_member_id),
  }));

  const gradientColors = members
    .map((item) => item.frequencyColor)
    .filter((color): color is FrequencyColorHex => Boolean(color));

  return {
    band: rowToBand(bandRow as BandRow),
    members,
    timeline,
    activities,
    gradientColors,
  };
}

export async function getViewerMemberId(): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const member = await getMemberByUserId(user.id);
  return member?.id ?? null;
}

export async function getBandActivityFeedForMember(
  memberId: string,
  limit = 30
): Promise<BandActivityFeedItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const { data: memberships, error: membershipError } = await supabase
    .from("band_members")
    .select("band_id")
    .eq("member_id", memberId);

  if (membershipError) {
    console.error("[Supabase] getBandActivityFeed memberships:", membershipError.message);
    return [];
  }

  const bandIds = (memberships ?? []).map((row) => row.band_id);
  if (bandIds.length === 0) {
    return [];
  }

  const { data: rows, error: activitiesError } = await supabase
    .from("band_activities")
    .select("*, bands(name)")
    .in("band_id", bandIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (activitiesError) {
    console.error("[Supabase] getBandActivityFeed activities:", activitiesError.message);
    return [];
  }

  const authorIds = [
    ...new Set((rows ?? []).map((row) => row.author_member_id)),
  ];
  const authors = await Promise.all(authorIds.map((id) => getMemberById(id)));
  const authorMap = new Map(
    authors.filter(Boolean).map((author) => [author!.id, author!])
  );

  return (rows ?? []).map((row): BandActivityFeedItem => {
    const band = row.bands as { name: string } | null;

    return {
      id: row.id,
      bandId: row.band_id,
      authorMemberId: row.author_member_id,
      kind: row.kind as BandActivity["kind"],
      title: row.title ?? undefined,
      body: row.body ?? undefined,
      mediaUrl: row.media_url ?? undefined,
      createdAt: row.created_at,
      author: authorMap.get(row.author_member_id),
      bandName: band?.name ?? "Band",
    };
  });
}
