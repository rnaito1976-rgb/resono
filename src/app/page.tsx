import { AppHeader } from "@/components/AppHeader";
import { PersonCard } from "@/components/PersonCard";
import { getMembers } from "@/lib/members";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const members = await getMembers();

  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <AppHeader />

      <div className="flex flex-col gap-10 px-5 pb-16 pt-4">
        {members.map((member) => (
          <PersonCard key={member.id} member={member} />
        ))}
      </div>
    </main>
  );
}
