"use server";

import { cache } from "react";
import { getMemberById, getMemberListById } from "@/lib/members";
import { isMemberOwnedByUser } from "@/lib/members/ownership";
import { resolveCurrentMemberId } from "@/lib/members/resolve";
import {
  getResonanceReasonsFromCache,
  saveResonanceReasonsToCache,
} from "@/lib/resonance/cache";
import { buildResonanceReason } from "@/lib/resonance/matching";
import { buildMusicSectionResonance } from "@/lib/music/profile-display";
import { getResonanceStatusForMember } from "@/lib/resonance/status";
import { getAuthSession } from "@/lib/supabase/auth";
import {
  getBandActivityFeedForMember,
  getBandsForMember,
  getMutualResonateMembers,
} from "@/lib/bands/queries";
import { getOwnMemberActivityFeed } from "@/lib/members/activity-feed";
import type { Band, BandActivityFeedItem, MutualResonateMember } from "@/types/band";
import type { Member } from "@/types/member";
import type { MusicPageView } from "@/types/music-profile";
import type { ResonanceReason } from "@/lib/resonance/matching";
import type { ResonanceStatus } from "@/lib/resonance/status";
import type { MemberActivityFeedItem } from "@/types/activity";

export type MemberProfilePayload = {
  member: Member;
  isOwnProfile: boolean;
  resonanceReason?: ResonanceReason;
  musicResonance?: MusicPageView["sectionResonance"];
  resonanceStatus?: ResonanceStatus;
  showResonateButton: boolean;
  mutualMembers: MutualResonateMember[];
  memberBands: Band[];
  bandActivities: BandActivityFeedItem[];
  memberActivities?: MemberActivityFeedItem[];
};

export type MemberProfileBandPayload = {
  mutualMembers: MutualResonateMember[];
  memberBands: Band[];
  bandActivities: BandActivityFeedItem[];
};

const loadMemberProfileBandData = cache(
  async (
    memberId: string,
    isOwnProfile: boolean,
    viewerMemberId: string | null
  ): Promise<MemberProfileBandPayload> => {
    const [mutualMembers, memberBands, bandActivities] = await Promise.all([
      isOwnProfile && viewerMemberId
        ? getMutualResonateMembers(viewerMemberId)
        : Promise.resolve([]),
      getBandsForMember(memberId),
      getBandActivityFeedForMember(memberId),
    ]);

    return { mutualMembers, memberBands, bandActivities };
  }
);

export async function getMemberProfileAction(
  memberId: string,
  options?: { light?: boolean }
): Promise<{ data?: MemberProfilePayload; error?: string }> {
  const [member, user, viewerMemberId] = await Promise.all([
    getMemberById(memberId),
    getAuthSession(),
    resolveCurrentMemberId(),
  ]);

  if (!member) {
    return { error: "not_found" };
  }

  if (!user) {
    return {
      data: {
        member,
        isOwnProfile: false,
        showResonateButton: false,
        mutualMembers: [],
        memberBands: [],
        bandActivities: [],
      },
    };
  }

  const isOwnProfile = isMemberOwnedByUser(member, user.id);
  const needsResonance =
    Boolean(viewerMemberId) && !isOwnProfile && viewerMemberId !== member.id;

  const viewerPromise: Promise<Member | undefined> =
    viewerMemberId && viewerMemberId === member.id
      ? Promise.resolve(member)
      : viewerMemberId
        ? getMemberListById(viewerMemberId)
        : Promise.resolve(undefined);

  const isLight = options?.light === true;

  const bandDataPromise = isLight
    ? Promise.resolve({
        mutualMembers: [],
        memberBands: [],
        bandActivities: [],
      } satisfies MemberProfileBandPayload)
    : loadMemberProfileBandData(memberId, isOwnProfile, viewerMemberId);

  const memberActivitiesPromise =
    !isLight && isOwnProfile
      ? getOwnMemberActivityFeed(memberId, 40, member)
      : Promise.resolve([] as MemberActivityFeedItem[]);

  const [viewer, resonanceStatus, cachedReasons, bandData, memberActivities] =
    await Promise.all([
    viewerPromise,
    needsResonance
      ? getResonanceStatusForMember(viewerMemberId!, member.id)
      : Promise.resolve(undefined),
    needsResonance
      ? getResonanceReasonsFromCache(viewerMemberId!, [member.id])
      : Promise.resolve(undefined),
    bandDataPromise,
    memberActivitiesPromise,
  ]);

  let resonanceReason: ResonanceReason | undefined;
  let musicResonance: MusicPageView["sectionResonance"] | undefined;

  if (viewer && needsResonance) {
    resonanceReason =
      cachedReasons?.get(member.id) ?? buildResonanceReason(viewer, member);

    if (!cachedReasons?.has(member.id)) {
      void saveResonanceReasonsToCache(viewer.id, [
        { targetMemberId: member.id, reason: resonanceReason },
      ]);
    }

    musicResonance = buildMusicSectionResonance(viewer, member);
  }

  return {
    data: {
      member,
      isOwnProfile,
      resonanceReason,
      musicResonance,
      resonanceStatus,
      showResonateButton: Boolean(viewer && needsResonance),
      mutualMembers: bandData.mutualMembers,
      memberBands: bandData.memberBands,
      bandActivities: bandData.bandActivities,
      memberActivities: isOwnProfile ? memberActivities : undefined,
    },
  };
}

/** Band タブ向け fallback lazy load */
export async function getMemberProfileBandDataAction(
  memberId: string
): Promise<{ data?: MemberProfileBandPayload; error?: string }> {
  const [member, user, viewerMemberId] = await Promise.all([
    getMemberById(memberId),
    getAuthSession(),
    resolveCurrentMemberId(),
  ]);

  if (!member) {
    return { error: "not_found" };
  }

  const isOwnProfile = Boolean(user && isMemberOwnedByUser(member, user.id));
  const data = await loadMemberProfileBandData(memberId, isOwnProfile, viewerMemberId);

  return { data };
}
