import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { HomeFeedList } from "@/components/home/HomeFeedList";
import { HomeThemeSync } from "@/components/home/HomeThemeSync";
import { PersonCard } from "@/components/person-card/PersonCard";
import { getHomeViewer } from "@/lib/home/viewer";
import { getHomeLcpImageHref } from "@/lib/images/lcp";
import { buildMembersFeedPage } from "@/lib/members/feed-builder";
import { INITIAL_FEED_PAGE_SIZE } from "@/lib/members/feed";
import { buildWelcomeOnboardingHref } from "@/lib/navigation/onboarding";

export default async function HomePage() {
  const { user, member, frequencyColor } = await getHomeViewer();

  if (user && !member) {
    redirect(buildWelcomeOnboardingHref());
  }

  const initialFeedPage =
    member || user
      ? await buildMembersFeedPage(0, INITIAL_FEED_PAGE_SIZE, {
          viewer: member,
          userId: user?.id,
          fast: true,
        })
      : undefined;

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
