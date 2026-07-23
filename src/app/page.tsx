import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { PersonCard } from "@/components/PersonCard";
import { getMemberByUserId, getMembers } from "@/lib/members";
import { isMemberOwnedByUser } from "@/lib/members/ownership";
import { isOnboardingComplete } from "@/lib/onboarding/status";
import { rankRecommendations } from "@/lib/recommendation/scoring";
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
    ? rankRecommendations(currentMember, feedMembers).map(({ member, recommendation }) => ({
        member,
        recommendation,
        reason: buildResonanceReason(currentMember, member),
      }))
    : feedMembers.map((member) => ({
        member,
        recommendation: undefined,
        reason: undefined,
      }));

  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <AppHeader initialUser={user} />

      <div className="flex flex-col gap-14 px-5 pb-20 pt-6">
        {currentMember ? (
          <PersonCard member={currentMember} isOwnCard priority />
        ) : null}

        {currentMember && rankedFeed.length > 0 ? (
          <section className="space-y-8">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
                For You
              </p>
              <h2 className="mt-2 text-[24px] font-light tracking-tight text-foreground">
                あなたへのおすすめ
              </h2>
            </div>

            <div className="flex flex-col gap-14">
              {rankedFeed.map(({ member, recommendation, reason }) => (
                <PersonCard
                  key={member.id}
                  member={member}
                  recommendation={recommendation}
                  resonanceReason={reason}
                />
              ))}
            </div>
          </section>
        ) : (
          rankedFeed.map(({ member, recommendation, reason }) => (
            <PersonCard
              key={member.id}
              member={member}
              recommendation={recommendation}
              resonanceReason={reason}
            />
          ))
        )}
      </div>
    </main>
  );
}
