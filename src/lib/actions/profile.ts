"use server";

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
} from "@/lib/bands/queries";
import type { Band, BandActivityFeedItem, MutualResonateMember } from "@/types/band";
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
  memberBands: Band[];
  bandActivities: BandActivityFeedItem[];
};

/** シート初回表示向け — 重い band / mutual 取得は省略 */
export async function getMemberProfileAction(
  memberId: string
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

  const [viewer, resonanceStatus, cachedReasons, memberBands, bandActivities] =
    await Promise.all([
    viewerPromise,
    needsResonance
      ? getResonanceStatusForMember(viewerMemberId!, member.id)
      : Promise.resolve(undefined),
    needsResonance
      ? getResonanceReasonsFromCache(viewerMemberId!, [member.id])
      : Promise.resolve(undefined),
    getBandsForMember(member.id),
    getBandActivityFeedForMember(member.id),
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
      mutualMembers: [],
      memberBands,
      bandActivities,
    },
  };
}
