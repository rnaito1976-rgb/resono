import { notFound } from "next/navigation";
import { getBandActivityFeedForMember, getMutualResonateMembers } from "@/lib/bands/queries";
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
import type { ResonanceReason } from "@/lib/resonance/matching";
import type { MusicPageView } from "@/types/music-profile";

export const dynamic = "force-dynamic";

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

  const [viewer, mutualMembers, bandActivities, resonanceStatus, cachedReasons] =
    await Promise.all([
      viewerMemberId && viewerMemberId !== member.id
        ? getMemberListById(viewerMemberId)
        : Promise.resolve(undefined),
      isOwnProfile && viewerMemberId
        ? getMutualResonateMembers(viewerMemberId)
        : Promise.resolve([]),
      viewerMemberId && !isOwnProfile
        ? getBandActivityFeedForMember(member.id)
        : Promise.resolve([]),
      needsResonance
        ? getResonanceStatusForMember(viewerMemberId!, member.id)
        : Promise.resolve(undefined),
      // 閲覧者の詳細取得を待たずに読めるので、同じ波で取りに行く
      needsResonance
        ? getResonanceReasonsFromCache(viewerMemberId!, [member.id])
        : Promise.resolve(undefined),
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
        mutualMembers={mutualMembers}
        bandActivities={bandActivities}
        priorityPhoto
      />
    </main>
  );
}
