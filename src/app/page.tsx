import { AppHeader } from "@/components/AppHeader";
import { HomeFeedList } from "@/components/home/HomeFeedList";
import { PersonCard } from "@/components/person-card/PersonCard";
import { getMemberByUserId } from "@/lib/members";
import { getMemberOnboardingState } from "@/lib/members/onboarding-state";
import { getHomeLcpImageHref } from "@/lib/images/lcp";
import { getAuthUser } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getAuthUser();

  if (user) {
    const [onboarding, currentMember] = await Promise.all([
      getMemberOnboardingState(user.id),
      getMemberByUserId(user.id, { columns: "list" }),
    ]);

    if (currentMember && !onboarding.complete) {
      redirect("/onboarding");
    }

    const lcpImageHref = getHomeLcpImageHref(currentMember, undefined);

    return (
      <>
        {lcpImageHref ? (
          <link rel="preload" as="image" href={lcpImageHref} fetchPriority="high" />
        ) : null}
        <main className="mx-auto min-h-dvh max-w-mobile bg-background">
          <AppHeader initialUser={user} />
          <div className="flex flex-col gap-14 px-5 pb-20 pt-6">
            {currentMember ? (
              <PersonCard member={currentMember} isOwnCard priority />
            ) : null}
            <HomeFeedList
              viewerId={currentMember?.id ?? user.id}
              showSectionHeader={Boolean(currentMember)}
            />
          </div>
        </main>
      </>
    );
  }

  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <AppHeader initialUser={null} />
      <div className="flex flex-col gap-14 px-5 pb-20 pt-6">
        <HomeFeedList />
      </div>
    </main>
  );
}
