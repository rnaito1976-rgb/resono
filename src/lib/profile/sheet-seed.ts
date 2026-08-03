import type { MemberProfilePayload } from "@/lib/actions/profile";
import type { ResonanceReason } from "@/lib/resonance/matching";
import type { ResonanceStatus } from "@/lib/resonance/status";
import type { Member } from "@/types/member";

export type ProfileSheetSeed = {
  member: Member;
  resonanceReason?: ResonanceReason;
  resonanceStatus?: ResonanceStatus;
};

export function buildMemberProfileSeed(seed: ProfileSheetSeed): MemberProfilePayload {
  return {
    member: seed.member,
    isOwnProfile: false,
    resonanceReason: seed.resonanceReason,
    resonanceStatus: seed.resonanceStatus,
    showResonateButton: Boolean(seed.resonanceReason),
    mutualMembers: [],
    memberBands: [],
    bandActivities: [],
  };
}
