import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { HomeFeed } from "@/components/home/HomeFeed";
import { buildMembersFeedPage } from "@/lib/members/feed-builder";
import { INITIAL_FEED_PAGE_SIZE } from "@/lib/members/feed";
import { getViewerContext } from "@/lib/members/viewer-context";
import { getHomeLcpImageHref } from "@/lib/images/lcp";
import { isOnboardingComplete } from "@/lib/onboarding/status";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { user, member: currentMember } = await getViewerContext();

  if (user && currentMember && !isOnboardingComplete(currentMember)) {
    redirect("/onboarding");
  }

  const initialFeedPage = await buildMembersFeedPage(0, INITIAL_FEED_PAGE_SIZE, {
    viewer: currentMember,
    userId: user?.id,
  });

  const lcpImageHref = getHomeLcpImageHref(
    currentMember,
    initialFeedPage.items[0]?.member
  );

  return (
    <>
      {lcpImageHref ? (
        <link rel="preload" as="image" href={lcpImageHref} fetchPriority="high" />
      ) : null}
      <main className="mx-auto min-h-dvh max-w-mobile bg-background">
        <AppHeader initialUser={user} />
        <HomeFeed
          viewerId={currentMember?.id ?? user?.id}
          currentMember={currentMember}
          initialFeedPage={initialFeedPage}
        />
      </main>
    </>
  );
}
