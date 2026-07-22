import { notFound } from "next/navigation";
import { MemberEditForm } from "@/components/MemberEditForm";
import { getMemberById } from "@/lib/members";

type MemberEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemberEditPage({ params }: MemberEditPageProps) {
  const { id } = await params;
  const member = await getMemberById(id);

  if (!member) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-mobile bg-background">
      <MemberEditForm member={member} />
    </main>
  );
}
