import { notFound } from "next/navigation";
import { getBandActivityFeedForMember, getMutualResonateMembers } from "@/lib/bands/queries";
import { getMemberById } from "@/lib/members";
import { isMemberOwnedByUser } from "@/lib/members/ownership";
import { resolveCurrentMemberId } from "@/lib/members/resolve";
import { buildResonanceReason } from "@/lib/resonance/matching";
import { getResonanceStatusForMember } from "@/lib/resonance/status";
import { MemberDetail } from "@/components/MemberDetail";
import { getAuthSession } from "@/lib/supabase/auth";

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

  const [viewer, mutualMembers, bandActivities, resonanceStatus] = await Promise.all([
    viewerMemberId ? getMemberById(viewerMemberId) : Promise.resolve(undefined),
    isOwnProfile && viewerMemberId
      ? getMutualResonateMembers(viewerMemberId)
      : Promise.resolve([]),
    viewerMemberId ? getBandActivityFeedForMember(member.id) : Promise.resolve([]),
    needsResonance
      ? getResonanceStatusForMember(viewerMemberId!, member.id)
      : Promise.resolve(undefined),
  ]);
  const resonanceReason =
    viewer && !isOwnProfile && viewer.id !== member.id
      ? buildResonanceReason(viewer, member)
      : undefined;

  return (
    <main className="mx-auto max-w-mobile bg-background">
      <MemberDetail
        member={member}
        isOwnProfile={isOwnProfile}
        resonanceReason={resonanceReason}
        resonanceStatus={resonanceStatus}
        showResonateButton={Boolean(viewer && !isOwnProfile)}
        mutualMembers={mutualMembers}
        bandActivities={bandActivities}
        priorityPhoto
      />
    </main>
  );
}
