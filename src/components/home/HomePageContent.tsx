import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { HomeFeedList } from "@/components/home/HomeFeedList";
import { HomeLiveFeed } from "@/components/home/HomeLiveFeed";
import { HomeThemeSync } from "@/components/home/HomeThemeSync";
import { PersonCard } from "@/components/person-card/PersonCard";
import { HomeFeedSkeleton } from "@/components/skeletons/HomeFeedSkeleton";
import { getHomeViewer } from "@/lib/home/viewer";
import { getHomeLcpImageHref } from "@/lib/images/lcp";
import { buildMembersFeedPage } from "@/lib/members/feed-builder";
import { INITIAL_FEED_PAGE_SIZE } from "@/lib/members/feed";
import { getLiveEvents } from "@/lib/live/events";
import { LIVE_FEED_SIZE } from "@/types/live";
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

  const [liveEvents, initialFeedPage] = await Promise.all([
    getLiveEvents(LIVE_FEED_SIZE),
    member || user
      ? buildMembersFeedPage({
          limit: INITIAL_FEED_PAGE_SIZE,
          viewer: member,
          userId: user?.id,
          fast: true,
        })
      : Promise.resolve(undefined),
  ]);

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
          <HomeLiveFeed events={liveEvents} />
          {member ? <PersonCard member={member} isOwnCard priority /> : null}
          <HomeFeedList
            viewerId={member?.id ?? user?.id}
            showSectionHeader={Boolean(member)}
            initialFeedPage={initialFeedPage}
          />
        </div>
      </main>
    </>
  );
}
