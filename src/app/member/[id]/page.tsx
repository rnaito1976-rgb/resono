import { notFound } from "next/navigation";
import { getMemberById, getMemberListById } from "@/lib/members";
import { isMemberOwnedByUser } from "@/lib/members/ownership";
import { resolveCurrentMemberId } from "@/lib/members/resolve";
import {
  buildResonanceReason,
} from "@/lib/resonance/matching";
import {
  getResonanceReasonsFromCache,
  saveResonanceReasonsToCache,
} from "@/lib/resonance/cache";
import { getResonanceStatusForMember } from "@/lib/resonance/status";
import { buildMusicSectionResonance } from "@/lib/music/profile-display";
import { MemberDetail } from "@/components/MemberDetail";
import { getAuthSession } from "@/lib/supabase/auth";
import {
  getBandActivityFeedForMember,
  getBandsForMember,
} from "@/lib/bands/queries";
import { getOwnMemberActivityFeed } from "@/lib/members/activity-feed";
import {
  getAppliedPartsForViewer,
  getRecruitmentApplicantsByPart,
} from "@/lib/recruitment/applications";
import type { ResonanceReason } from "@/lib/resonance/matching";
import type { MusicPageView } from "@/types/music-profile";

type MemberPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemberPage({ params }: MemberPageProps) {
  const { id } = await params;
  const [member, user, viewerMemberId] = await Promise.all([
    getMemberById(id),
    getAuthSession(),
    resolveCurrentMemberId(),
  ]);

  if (!member) {
    notFound();
  }

  const isOwnProfile = Boolean(user && isMemberOwnedByUser(member, user.id));
  const needsResonance =
    Boolean(viewerMemberId) && !isOwnProfile && viewerMemberId !== member.id;

  const [viewer, resonanceStatus, cachedReasons, memberBands, bandActivities, ownMemberActivities, recruitmentAppliedParts, recruitmentApplicants] =
    await Promise.all([
    viewerMemberId && viewerMemberId !== member.id
      ? getMemberListById(viewerMemberId)
      : Promise.resolve(undefined),
    needsResonance
      ? getResonanceStatusForMember(viewerMemberId!, member.id)
      : Promise.resolve(undefined),
    needsResonance
      ? getResonanceReasonsFromCache(viewerMemberId!, [member.id])
      : Promise.resolve(undefined),
    user ? getBandsForMember(member.id) : Promise.resolve([]),
    user ? getBandActivityFeedForMember(member.id) : Promise.resolve([]),
    isOwnProfile
      ? getOwnMemberActivityFeed(member.id, 40, member)
      : Promise.resolve([]),
    needsResonance
      ? getAppliedPartsForViewer(viewerMemberId!, member.id)
      : Promise.resolve([]),
    isOwnProfile && member.lookingFor?.parts?.some(Boolean)
      ? getRecruitmentApplicantsByPart(member.id)
      : Promise.resolve([]),
  ]);

  let resonanceReason: ResonanceReason | undefined;
  let musicResonance: MusicPageView["sectionResonance"] | undefined;

  if (viewer && !isOwnProfile && viewer.id !== member.id) {
    resonanceReason =
      cachedReasons?.get(member.id) ?? buildResonanceReason(viewer, member);

    if (!cachedReasons?.has(member.id)) {
      void saveResonanceReasonsToCache(viewer.id, [
        { targetMemberId: member.id, reason: resonanceReason },
      ]);
    }

    musicResonance = buildMusicSectionResonance(viewer, member);
  }

  return (
    <main className="mx-auto max-w-mobile bg-background">
      <MemberDetail
        member={member}
        isOwnProfile={isOwnProfile}
        resonanceReason={resonanceReason}
        musicResonance={musicResonance}
        resonanceStatus={resonanceStatus}
        showResonateButton={Boolean(viewer && !isOwnProfile)}
        memberBands={memberBands}
        bandActivities={bandActivities}
        memberActivities={isOwnProfile ? ownMemberActivities : undefined}
        recruitmentAppliedParts={recruitmentAppliedParts}
        recruitmentApplicants={recruitmentApplicants}
        priorityPhoto
      />
    </main>
  );
}
