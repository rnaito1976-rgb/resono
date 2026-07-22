import { notFound } from "next/navigation";
import { getMemberById } from "@/lib/members";
import { MemberDetail } from "@/components/MemberDetail";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <main className="mx-auto max-w-mobile bg-background">
      <MemberDetail member={member} isOwnProfile={isOwnProfile} />
    </main>
  );
}
