import { notFound, redirect } from "next/navigation";
import { MemberEditForm } from "@/components/MemberEditForm";
import { getMemberById } from "@/lib/members";
import { isMemberOwnedByUser } from "@/lib/members/ownership";
import { getAuthUser } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

type MemberEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemberEditPage({ params }: MemberEditPageProps) {
  const { id } = await params;
  const [member, user] = await Promise.all([getMemberById(id), getAuthUser()]);

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
