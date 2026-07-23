import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { PersonCard } from "@/components/PersonCard";
import { getMemberByUserId, getMembers } from "@/lib/members";
import { isMemberOwnedByUser } from "@/lib/members/ownership";
import { isOnboardingComplete } from "@/lib/onboarding/status";
import { buildResonanceReason } from "@/lib/resonance/matching";
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

  const feedMembers = members.filter((member) => {
    if (currentMember && member.id === currentMember.id) {
      return false;
    }

    if (user && isMemberOwnedByUser(member, user.id)) {
      return false;
    }

    return true;
  });

  const rankedFeed = currentMember
    ? [...feedMembers]
        .map((member) => ({
          member,
          reason: buildResonanceReason(currentMember, member),
        }))
        .sort((a, b) => b.reason.score - a.reason.score)
    : feedMembers.map((member) => ({ member, reason: undefined }));

  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <AppHeader initialUser={user} />

      <div className="flex flex-col gap-14 px-5 pb-20 pt-6">
        {currentMember ? (
          <PersonCard member={currentMember} isOwnCard priority />
        ) : null}

        {rankedFeed.map(({ member, reason }) => (
          <PersonCard
            key={member.id}
            member={member}
            resonanceReason={reason}
          />
        ))}
      </div>
    </main>
  );
}
