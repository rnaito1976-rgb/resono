import { notFound } from "next/navigation";
import { getMemberById, getMemberByUserId } from "@/lib/members";
import { calculateResonanceMatch } from "@/lib/resonance/matching";
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

  const isOwnProfile = Boolean(user && member.userId === user.id);
  const viewer = user ? await getMemberByUserId(user.id) : undefined;
  const resonanceScore =
    viewer && !isOwnProfile ? calculateResonanceMatch(viewer, member) : undefined;

  return (
    <main className="mx-auto max-w-mobile bg-background">
      <MemberDetail
        member={member}
        isOwnProfile={isOwnProfile}
        resonanceScore={resonanceScore}
        showResonateButton={Boolean(viewer && !isOwnProfile)}
      />
    </main>
  );
}
