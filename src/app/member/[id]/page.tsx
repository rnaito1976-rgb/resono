import { notFound } from "next/navigation";
import { getMemberById } from "@/lib/members";
import { MemberDetail } from "@/components/MemberDetail";

type MemberPageProps = {
  params: Promise<{ id: string }>;
};

export default async function MemberPage({ params }: MemberPageProps) {
  const { id } = await params;
  const member = await getMemberById(id);

  if (!member) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-mobile bg-background">
      <MemberDetail member={member} />
    </main>
  );
}
