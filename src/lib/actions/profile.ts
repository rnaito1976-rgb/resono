"use server";

import {
  getBandActivityFeedForMember,
  getMutualResonateMembers,
} from "@/lib/bands/queries";
import { getMemberById } from "@/lib/members";
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
import type { BandActivityFeedItem, MutualResonateMember } from "@/types/band";
import type { Member } from "@/types/member";
import type { MusicPageView } from "@/types/music-profile";
import type { ResonanceReason } from "@/lib/resonance/matching";
import type { ResonanceStatus } from "@/lib/resonance/status";

export type MemberProfilePayload = {
  member: Member;
  isOwnProfile: boolean;
  resonanceReason?: ResonanceReason;
  musicResonance?: MusicPageView["sectionResonance"];
  resonanceStatus?: ResonanceStatus;
  showResonateButton: boolean;
  mutualMembers: MutualResonateMember[];
  bandActivities: BandActivityFeedItem[];
};

export async function getMemberProfileAction(
  memberId: string
): Promise<{ data?: MemberProfilePayload; error?: string }> {
  const [member, user] = await Promise.all([
    getMemberById(memberId),
    getAuthSession(),
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
        bandActivities: [],
      },
    };
  }

  const viewerMemberId = await resolveCurrentMemberId();
  const isOwnProfile = isMemberOwnedByUser(member, user.id);

  const viewerPromise: Promise<Member | undefined> =
    viewerMemberId && viewerMemberId === member.id
      ? Promise.resolve(member)
      : viewerMemberId
        ? getMemberById(viewerMemberId)
        : Promise.resolve(undefined);

  const [viewer, mutualMembers, bandActivities, resonanceStatus] = await Promise.all([
    viewerPromise,
    isOwnProfile && viewerMemberId
      ? getMutualResonateMembers(viewerMemberId)
      : Promise.resolve([]),
    viewerMemberId ? getBandActivityFeedForMember(member.id) : Promise.resolve([]),
    viewerMemberId && !isOwnProfile && viewerMemberId !== member.id
      ? getResonanceStatusForMember(viewerMemberId, member.id)
      : Promise.resolve(undefined),
  ]);

  let resonanceReason: ResonanceReason | undefined;
  let musicResonance: MusicPageView["sectionResonance"] | undefined;

  if (viewer && !isOwnProfile && viewer.id !== member.id) {
    const cached = await getResonanceReasonsFromCache(viewer.id, [member.id]);
    resonanceReason =
      cached.get(member.id) ?? buildResonanceReason(viewer, member);

    if (!cached.has(member.id)) {
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
      showResonateButton: Boolean(viewer && !isOwnProfile),
      mutualMembers,
      bandActivities,
    },
  };
}
