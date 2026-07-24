"use server";

import {
  getBandActivityFeedForMember,
  getMutualResonateMembers,
} from "@/lib/bands/queries";
import { getMemberById, getMemberByUserId } from "@/lib/members";
import { isMemberOwnedByUser } from "@/lib/members/ownership";
import {
  getResonanceReasonsFromCache,
  saveResonanceReasonsToCache,
} from "@/lib/resonance/cache";
import { buildResonanceReason } from "@/lib/resonance/matching";
import { getResonanceStatusForMember } from "@/lib/resonance/status";
import { createClient } from "@/lib/supabase/server";
import type { BandActivityFeedItem, MutualResonateMember } from "@/types/band";
import type { Member } from "@/types/member";
import type { ResonanceReason } from "@/lib/resonance/matching";
import type { ResonanceStatus } from "@/lib/resonance/status";

export type MemberProfilePayload = {
  member: Member;
  isOwnProfile: boolean;
  resonanceReason?: ResonanceReason;
  resonanceStatus?: ResonanceStatus;
  showResonateButton: boolean;
  mutualMembers: MutualResonateMember[];
  bandActivities: BandActivityFeedItem[];
};

export async function getMemberProfileAction(
  memberId: string
): Promise<{ data?: MemberProfilePayload; error?: string }> {
  const [member, supabase] = await Promise.all([
    getMemberById(memberId),
    createClient(),
  ]);

  if (!member) {
    return { error: "not_found" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const viewer = user ? await getMemberByUserId(user.id) : undefined;
  const isOwnProfile = Boolean(user && isMemberOwnedByUser(member, user.id));

  const [mutualMembers, bandActivities, resonanceStatus] = await Promise.all([
    isOwnProfile && viewer
      ? getMutualResonateMembers(viewer.id)
      : Promise.resolve([]),
    viewer ? getBandActivityFeedForMember(member.id) : Promise.resolve([]),
    viewer && !isOwnProfile && viewer.id !== member.id
      ? getResonanceStatusForMember(viewer.id, member.id)
      : Promise.resolve(undefined),
  ]);

  let resonanceReason: ResonanceReason | undefined;

  if (viewer && !isOwnProfile && viewer.id !== member.id) {
    const cached = await getResonanceReasonsFromCache(viewer.id, [member.id]);
    resonanceReason =
      cached.get(member.id) ?? buildResonanceReason(viewer, member);

    if (!cached.has(member.id)) {
      void saveResonanceReasonsToCache(viewer.id, [
        { targetMemberId: member.id, reason: resonanceReason },
      ]);
    }
  }

  return {
    data: {
      member,
      isOwnProfile,
      resonanceReason,
      resonanceStatus,
      showResonateButton: Boolean(viewer && !isOwnProfile),
      mutualMembers,
      bandActivities,
    },
  };
}
