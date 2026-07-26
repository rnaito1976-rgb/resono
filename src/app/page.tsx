import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { HomeFeedSection } from "@/components/home/HomeFeedSection";
import { HomeThemeSync } from "@/components/home/HomeThemeSync";
import { PersonCard } from "@/components/person-card/PersonCard";
import { HomeFeedSkeleton } from "@/components/skeletons/HomeFeedSkeleton";
import { getHomeViewer } from "@/lib/home/viewer";
import { getHomeLcpImageHref } from "@/lib/images/lcp";
import { buildWelcomeOnboardingHref } from "@/lib/navigation/onboarding";

export default async function HomePage() {
  const { user, member, frequencyColor } = await getHomeViewer();

  if (user && !member) {
    redirect(buildWelcomeOnboardingHref());
  }

  const lcpImageHref = getHomeLcpImageHref(member, undefined);

  return (
    <>
      <HomeThemeSync color={frequencyColor} />
      {lcpImageHref ? (
        <link rel="preload" as="image" href={lcpImageHref} fetchPriority="high" />
      ) : null}
      <main className="mx-auto min-h-dvh max-w-mobile bg-background">
        <AppHeader initialUser={user} />
        <div className="flex flex-col gap-14 px-5 pb-20 pt-6">
          {member ? <PersonCard member={member} isOwnCard priority /> : null}
          <Suspense fallback={<HomeFeedSkeleton count={member ? 2 : 3} />}>
            <HomeFeedSection
              member={member}
              userId={user?.id}
              showSectionHeader={Boolean(member)}
            />
          </Suspense>
        </div>
      </main>
    </>
  );
}
