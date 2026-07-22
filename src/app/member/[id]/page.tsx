import { notFound } from "next/navigation";
import { MemberDetail } from "@/components/MemberDetail";
import { getMemberById } from "@/data/members";

type MemberPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemberPage({ params }: MemberPageProps) {
  const { id } = await params;
  const member = getMemberById(id);

  if (!member) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-mobile bg-background">
      <MemberDetail member={member} />
    </main>
  );
}
