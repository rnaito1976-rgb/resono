import { notFound } from "next/navigation";
import { getMutualResonateMembers } from "@/lib/bands/queries";
import { getMemberById, getMemberByUserId } from "@/lib/members";
import { isMemberOwnedByUser } from "@/lib/members/ownership";
import { buildResonanceReason } from "@/lib/resonance/matching";
import { MemberDetail } from "@/components/MemberDetail";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MemberPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemberPage({ params }: MemberPageProps) {
  const { id } = await params;
  const [member, supabase] = await Promise.all([getMemberById(id), createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!member) {
    notFound();
  }

  const isOwnProfile = Boolean(user && isMemberOwnedByUser(member, user.id));
  const viewer = user ? await getMemberByUserId(user.id) : undefined;
  const mutualMembers =
    isOwnProfile && viewer ? await getMutualResonateMembers(viewer.id) : [];
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
        showResonateButton={Boolean(viewer && !isOwnProfile)}
        mutualMembers={mutualMembers}
      />
    </main>
  );
}
