import { notFound, redirect } from "next/navigation";
import { MemberEditForm } from "@/components/MemberEditForm";
import { getMemberById } from "@/lib/members";
import { isMemberOwnedByUser } from "@/lib/members/ownership";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type MemberEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemberEditPage({ params }: MemberEditPageProps) {
  const { id } = await params;
  const [member, supabase] = await Promise.all([getMemberById(id), createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!member) {
    notFound();
  }

  if (!user || !isMemberOwnedByUser(member, user.id)) {
    redirect(`/member/${id}`);
  }

  return (
    <main className="mx-auto max-w-mobile bg-background">
      <MemberEditForm member={member} />
    </main>
  );
}
