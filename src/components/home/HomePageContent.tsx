import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/AppHeader";
import { HomeFeedSection } from "@/components/home/HomeFeedSection";
import { HomeHeroCta } from "@/components/home/HomeHeroCta";
import { HomeLiveFeed } from "@/components/home/HomeLiveFeed";
import { HomeMembersBrowseProvider } from "@/components/home/HomeMembersBrowseShell";
import { HomeNewMembersSection } from "@/components/home/HomeNewMembersSection";
import { HomeThemeSync } from "@/components/home/HomeThemeSync";
import { HomeFeedSkeleton } from "@/components/skeletons/HomeFeedSkeleton";
import { IntroOnboardingCards } from "@/components/onboarding/IntroOnboardingCards";
import { SeoFooterLinks } from "@/components/seo/SeoFooterLinks";
import { getHomeViewer } from "@/lib/home/viewer";
import { getTodayMembers } from "@/lib/members";
import { HOME_H1, HOME_LEAD } from "@/lib/seo/site";
import { getHomeLcpImageHref } from "@/lib/images/lcp";
import { getLiveEvents } from "@/lib/live/events";
import { LIVE_FEED_SIZE } from "@/types/live";

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
        <HomeFeedSkeleton count={2} />
      </div>
    </main>
  );
}

export async function HomePageContent() {
  const [{ user, member, frequencyColor }, liveEvents, todayMembers] = await Promise.all([
    getHomeViewer(),
    getLiveEvents(LIVE_FEED_SIZE),
    getTodayMembers(6),
  ]);

  if (user && !member) {
    redirect("/welcome");
  }

  const lcpImageHref = getHomeLcpImageHref(member, undefined);

  return (
    <>
      <HomeThemeSync color={frequencyColor} />
      {lcpImageHref ? (
        <link rel="preload" as="image" href={lcpImageHref} fetchPriority="high" />
      ) : null}
      <main className="mx-auto min-h-dvh max-w-mobile bg-background">
        <HomeMembersBrowseProvider>
          <AppHeader initialUser={user} />
          <div className="space-y-2 px-5 pb-4 pt-2">
            <h1 className="text-[22px] font-light leading-snug tracking-tight text-white/90">
              {HOME_H1}
            </h1>
            <p className="text-[15px] leading-relaxed text-white/55">{HOME_LEAD}</p>
            <HomeHeroCta isLoggedIn={Boolean(user)} />
          </div>
          <div className="flex flex-col gap-14 px-5 pb-20 pt-2">
            {user ? <IntroOnboardingCards userId={user.id} /> : null}
            {todayMembers.length > 0 ? (
              <HomeNewMembersSection members={todayMembers} title="今日登録した人" />
            ) : null}
            {liveEvents.length > 0 ? <HomeLiveFeed events={liveEvents} /> : null}
            <Suspense fallback={<HomeFeedSkeleton count={2} />}>
              <HomeFeedSection
                member={member}
                userId={user?.id}
                showSectionHeader={Boolean(member)}
              />
            </Suspense>
            <SeoFooterLinks />
          </div>
        </HomeMembersBrowseProvider>
      </main>
    </>
  );
}
