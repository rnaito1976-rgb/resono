import { cache } from "react";
import { getFrequencyColorsByUserIds } from "@/lib/frequency-color/server";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { getMemberById, getMembersByIds } from "@/lib/members";
import { resolveCurrentMemberId } from "@/lib/members/resolve";
import { getConversationIdsForMemberPairs } from "@/lib/resonance/status";
import { calculateResonanceMatch } from "@/lib/resonance/matching";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAnonClient } from "@/lib/supabase/anon";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  Band,
  BandActivity,
  BandActivityFeedItem,
  BandCoverSong,
  BandDetail,
  BandMember,
  BandTimelineEvent,
  MutualResonateMember,
} from "@/types/band";
import type { Member } from "@/types/member";

const BAND_DETAIL_COLUMNS =
  "id,name,accent_color,activity_status,created_by_member_id,created_at" as const;
const BAND_TIMELINE_COLUMNS =
  "id,band_id,kind,title,body,occurred_at,activity_id" as const;
const BAND_ACTIVITY_COLUMNS =
  "id,band_id,author_member_id,kind,title,body,media_url,created_at" as const;
const BAND_COVER_SONG_COLUMNS =
  "id,band_id,added_by_member_id,artist,title,created_at" as const;

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

export const getBandGradientColorsMap = cache(async function getBandGradientColorsMap(
  bandIds: string[]
): Promise<Map<string, FrequencyColorHex[]>> {
  const result = new Map<string, FrequencyColorHex[]>();
  const uniqueIds = [...new Set(bandIds.filter(Boolean))];

  if (!isSupabaseConfigured() || uniqueIds.length === 0) {
    return result;
  }

  const admin = createAdminClient();
  const reader = admin ?? createAnonClient();

  try {
    const [{ data: bandRows }, { data: memberRows }] = await Promise.all([
      reader.from("bands").select("id, accent_color").in("id", uniqueIds),
      reader
        .from("band_members")
        .select("band_id, member_id")
        .in("band_id", uniqueIds),
    ]);

    const accentByBand = new Map(
      (bandRows ?? []).map((row) => [
        row.id,
        (row.accent_color as FrequencyColorHex | null) ?? undefined,
      ])
    );

    const memberIdsByBand = new Map<string, string[]>();
    for (const row of memberRows ?? []) {
      const list = memberIdsByBand.get(row.band_id) ?? [];
      list.push(row.member_id);
      memberIdsByBand.set(row.band_id, list);
    }

    const allMemberIds = [...new Set([...memberIdsByBand.values()].flat())];
    const memberMap = await getMembersByIds(allMemberIds);
    const userIds = [
      ...new Set(
        [...memberMap.values()]
          .map((member) => member.userId)
          .filter((userId): userId is string => Boolean(userId))
      ),
    ];
    const colorMap = await getFrequencyColorsByUserIds(userIds);

    for (const bandId of uniqueIds) {
      const colors = (memberIdsByBand.get(bandId) ?? [])
        .map((memberId) => memberMap.get(memberId)?.userId)
        .filter((userId): userId is string => Boolean(userId))
        .map((userId) => colorMap.get(userId))
        .filter((color): color is FrequencyColorHex => Boolean(color));

      const uniqueColors = [...new Set(colors)].slice(0, 5);

      if (uniqueColors.length > 0) {
        result.set(bandId, uniqueColors);
        continue;
      }

      const accent = accentByBand.get(bandId);
      if (accent) {
        result.set(bandId, [accent]);
      }
    }
  } catch (error) {
    console.error("[Supabase] getBandGradientColorsMap:", error);
  }

  return result;
});

export const getMemberBandIds = cache(async (memberId: string): Promise<string[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("band_members")
    .select("band_id")
    .eq("member_id", memberId);

  if (error) {
    console.error("[Supabase] getMemberBandIds:", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.band_id);
});

export async function getBandsForMember(memberId: string): Promise<Band[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const bandIds = await getMemberBandIds(memberId);
  if (bandIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("bands")
    .select(BAND_DETAIL_COLUMNS)
    .in("id", bandIds);

  if (error) {
    console.error("[Supabase] getBandsForMember:", error.message);
    return [];
  }

  const bandMap = new Map(
    (data ?? []).map((row) => [row.id, rowToBand(row as BandRow)])
  );

  return bandIds
    .map((bandId) => bandMap.get(bandId))
    .filter((band): band is Band => Boolean(band));
}

export async function getMutualResonateMembers(
  viewerMemberId?: string
): Promise<MutualResonateMember[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const resolvedViewerId = viewerMemberId ?? (await resolveCurrentMemberId());
  if (!resolvedViewerId) {
    return [];
  }

  const supabase = await createClient();
  const [incomingResult, outgoingResult] = await Promise.all([
    supabase
      .from("resonances")
      .select("from_member_id, created_at")
      .eq("to_member_id", resolvedViewerId),
    supabase
      .from("resonances")
      .select("to_member_id, created_at")
      .eq("from_member_id", resolvedViewerId),
  ]);

  const { data: incoming, error: incomingError } = incomingResult;
  const { data: outgoing, error: outgoingError } = outgoingResult;

  if (incomingError) {
    console.error("[Supabase] getMutualResonateMembers incoming:", incomingError.message);
    return [];
  }

  if (outgoingError) {
    console.error("[Supabase] getMutualResonateMembers outgoing:", outgoingError.message);
    return [];
  }

  if (!incoming?.length || !outgoing?.length) {
    return [];
  }

  const incomingMap = new Map(incoming.map((row) => [row.from_member_id, row.created_at]));
  const mutualRows = outgoing.filter((row) => incomingMap.has(row.to_member_id));

  if (mutualRows.length === 0) {
    return [];
  }

  const mutualIds = mutualRows.map((row) => row.to_member_id);
  const [memberMap, conversationMap] = await Promise.all([
    getMembersByIds(mutualIds),
    getConversationIdsForMemberPairs(resolvedViewerId, mutualIds),
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

  return results.map((item) => ({
    ...item,
    frequencyColor: item.member.frequencyColor as FrequencyColorHex | undefined,
  }));
}

export async function getAddableMutualMembersForBand(
  bandId: string,
  viewerMemberId?: string
): Promise<MutualResonateMember[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const { data: existingRows, error: existingError } = await supabase
    .from("band_members")
    .select("member_id")
    .eq("band_id", bandId);

  if (existingError) {
    console.error(
      "[Supabase] getAddableMutualMembersForBand existing:",
      existingError.message
    );
    return [];
  }

  const existingIds = new Set((existingRows ?? []).map((row) => row.member_id));
  const mutualMembers = await getMutualResonateMembers(viewerMemberId);

  return mutualMembers.filter((item) => !existingIds.has(item.member.id));
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
  const [{ data: bandRow, error: bandError }, viewer, { data: membership }] =
    await Promise.all([
      supabase
        .from("bands")
        .select(BAND_DETAIL_COLUMNS)
        .eq("id", bandId)
        .maybeSingle(),
      getMemberById(viewerMemberId),
      supabase
        .from("band_members")
        .select("member_id")
        .eq("band_id", bandId)
        .eq("member_id", viewerMemberId)
        .maybeSingle(),
    ]);

  if (bandError || !bandRow) {
    return null;
  }

  if (!membership) {
    return null;
  }

  const [members, timelineResult, activitiesResult, coverSongsResult] =
    await Promise.all([
    loadBandMembers(bandId, viewer ?? undefined),
    supabase
      .from("band_timeline_events")
      .select(BAND_TIMELINE_COLUMNS)
      .eq("band_id", bandId)
      .order("occurred_at", { ascending: false }),
    supabase
      .from("band_activities")
      .select(BAND_ACTIVITY_COLUMNS)
      .eq("band_id", bandId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("band_cover_songs")
      .select(BAND_COVER_SONG_COLUMNS)
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
  const addedByIds = [
    ...new Set((coverSongsResult.data ?? []).map((row) => row.added_by_member_id)),
  ];
  const memberMap = await getMembersByIds([...new Set([...authorIds, ...addedByIds])]);
  const activities = (activitiesResult.data ?? []).map((row): BandActivity => ({
    id: row.id,
    bandId: row.band_id,
    authorMemberId: row.author_member_id,
    kind: row.kind as BandActivity["kind"],
    title: row.title ?? undefined,
    body: row.body ?? undefined,
    mediaUrl: row.media_url ?? undefined,
    createdAt: row.created_at,
    author: memberMap.get(row.author_member_id),
  }));

  const coverSongs = (coverSongsResult.data ?? []).map((row): BandCoverSong => ({
    id: row.id,
    bandId: row.band_id,
    addedByMemberId: row.added_by_member_id,
    artist: row.artist,
    title: row.title,
    createdAt: row.created_at,
    addedBy: memberMap.get(row.added_by_member_id),
  }));

  const gradientColors = members
    .map((item) => item.frequencyColor)
    .filter((color): color is FrequencyColorHex => Boolean(color));

  return {
    band: rowToBand(bandRow as BandRow),
    members,
    timeline,
    activities,
    coverSongs,
    gradientColors,
  };
}

export async function getViewerMemberId(): Promise<string | null> {
  return resolveCurrentMemberId();
}

export async function getBandActivityFeedForMember(
  memberId: string,
  limit = 30
): Promise<BandActivityFeedItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const bandIds = await getMemberBandIds(memberId);
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
  const authorMap = await getMembersByIds(authorIds);
  const gradientMap = await getBandGradientColorsMap(bandIds);

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
      gradientColors: gradientMap.get(row.band_id),
    };
  });
}
