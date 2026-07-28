import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { HomeFeedSection } from "@/components/home/HomeFeedSection";
import { HomeLiveSection } from "@/components/home/HomeLiveSection";
import { HomeThemeSync } from "@/components/home/HomeThemeSync";
import { PersonCard } from "@/components/person-card/PersonCard";
import { HomeFeedSkeleton } from "@/components/skeletons/HomeFeedSkeleton";
import { getHomeViewer } from "@/lib/home/viewer";
import { getHomeLcpImageHref } from "@/lib/images/lcp";
import { buildWelcomeOnboardingHref } from "@/lib/navigation/onboarding";

export function HomePageFallback() {
  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <div className="h-14 px-5 pt-6" />
      <div className="flex flex-col gap-14 px-5 pb-20 pt-6">
        <div className="space-y-4">
          <div className="h-3 w-12 animate-pulse rounded-full bg-white/10" />
          <div className="h-7 w-48 animate-pulse rounded-full bg-white/10" />
          <div className="flex gap-3 overflow-hidden">
            <div className="h-[88px] w-[220px] shrink-0 animate-pulse rounded-[20px] bg-white/[0.04]" />
            <div className="h-[88px] w-[220px] shrink-0 animate-pulse rounded-[20px] bg-white/[0.04]" />
          </div>
        </div>
        <div className="aspect-square w-full animate-pulse rounded-[28px] bg-white/[0.04]" />
        <HomeFeedSkeleton count={2} />
      </div>
    </main>
  );
}

export async function HomePageContent() {
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
          <Suspense
            fallback={
              <div className="space-y-4">
                <div className="h-3 w-12 animate-pulse rounded-full bg-white/10" />
                <div className="h-7 w-48 animate-pulse rounded-full bg-white/10" />
                <div className="flex gap-3 overflow-hidden">
                  <div className="h-[88px] w-[220px] shrink-0 animate-pulse rounded-[20px] bg-white/[0.04]" />
                  <div className="h-[88px] w-[220px] shrink-0 animate-pulse rounded-[20px] bg-white/[0.04]" />
                </div>
              </div>
            }
          >
            <HomeLiveSection />
          </Suspense>
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
