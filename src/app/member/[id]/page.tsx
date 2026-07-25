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
  const [member, user] = await Promise.all([getMemberById(id), getAuthSession()]);

  if (!member) {
    notFound();
  }

  const viewerMemberId = user ? await resolveCurrentMemberId() : null;
  const viewer = viewerMemberId ? await getMemberById(viewerMemberId) : undefined;
  const isOwnProfile = Boolean(user && isMemberOwnedByUser(member, user.id));

  const [mutualMembers, bandActivities, resonanceStatus] = await Promise.all([
    isOwnProfile && viewer ? getMutualResonateMembers(viewer.id) : Promise.resolve([]),
    viewer ? getBandActivityFeedForMember(member.id) : Promise.resolve([]),
    viewer && !isOwnProfile && viewer.id !== member.id
      ? getResonanceStatusForMember(viewer.id, member.id)
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
