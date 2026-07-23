import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { PersonCard } from "@/components/PersonCard";
import { getMemberByUserId, getMembers } from "@/lib/members";
import { isOnboardingComplete } from "@/lib/onboarding/status";
import { calculateResonanceMatch } from "@/lib/resonance/matching";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [members, supabase] = await Promise.all([getMembers(), createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentMember = user ? await getMemberByUserId(user.id) : undefined;

  if (user && currentMember && !isOnboardingComplete(currentMember)) {
    redirect("/onboarding");
  }

  const feedMembers = currentMember
    ? members.filter((member) => member.id !== currentMember.id)
    : members;

  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <AppHeader initialUser={user} />

      <div className="flex flex-col gap-14 px-5 pb-20 pt-6">
        {currentMember ? (
          <PersonCard member={currentMember} isOwnCard priority />
        ) : null}

        {feedMembers.map((member) => (
          <PersonCard
            key={member.id}
            member={member}
            resonanceScore={
              currentMember
                ? calculateResonanceMatch(currentMember, member)
                : member.resonanceRate
            }
          />
        ))}
      </div>
    </main>
  );
}
