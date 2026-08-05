import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/AppHeader";
import { HomeFeedSection } from "@/components/home/HomeFeedSection";
import { HomeLiveFeed } from "@/components/home/HomeLiveFeed";
import { HomeThemeSync } from "@/components/home/HomeThemeSync";
import { PersonCard } from "@/components/person-card/PersonCard";
import { HomeFeedSkeleton } from "@/components/skeletons/HomeFeedSkeleton";
import { IntroOnboardingCards } from "@/components/onboarding/IntroOnboardingCards";
import { SeoFooterLinks } from "@/components/seo/SeoFooterLinks";
import { BRAND_CATCH_COPY_INLINE } from "@/lib/branding/copy";
import { getHomeViewer } from "@/lib/home/viewer";
import { HOME_H1, HOME_LEAD } from "@/lib/seo/site";
import { getHomeLcpImageHref } from "@/lib/images/lcp";
import { getLiveEvents } from "@/lib/live/events";
import { getRecruitmentApplicantsByPart } from "@/lib/recruitment/applications";
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
        <div className="aspect-square w-full animate-pulse rounded-[28px] bg-white/[0.04]" />
        <HomeFeedSkeleton count={2} />
      </div>
    </main>
  );
}

export async function HomePageContent() {
  const [{ user, member, frequencyColor }, liveEvents] = await Promise.all([
    getHomeViewer(),
    getLiveEvents(LIVE_FEED_SIZE),
  ]);

  if (user && !member) {
    redirect("/welcome");
  }

  const ownRecruitmentApplicants =
    member?.lookingFor?.parts?.some(Boolean)
      ? await getRecruitmentApplicantsByPart(member.id)
      : [];

  const lcpImageHref = getHomeLcpImageHref(member, undefined);

  return (
    <>
      <HomeThemeSync color={frequencyColor} />
      {lcpImageHref ? (
        <link rel="preload" as="image" href={lcpImageHref} fetchPriority="high" />
      ) : null}
      <main className="mx-auto min-h-dvh max-w-mobile bg-background">
        <AppHeader initialUser={user} />
        <div className="space-y-2 px-5 pb-4 pt-2">
          <h1 className="text-[22px] font-light leading-snug tracking-tight text-white/90">
            {HOME_H1}
          </h1>
          <p className="text-[15px] leading-relaxed text-white/55">{HOME_LEAD}</p>
          <p className="text-[14px] leading-relaxed text-white/40">
            {BRAND_CATCH_COPY_INLINE}
          </p>
        </div>
        <div className="flex flex-col gap-14 px-5 pb-20 pt-2">
          {user ? <IntroOnboardingCards userId={user.id} /> : null}
          <HomeLiveFeed events={liveEvents} />
          {member ? (
            <PersonCard
              member={member}
              isOwnCard
              priority
              initialRecruitmentApplicants={ownRecruitmentApplicants}
            />
          ) : null}
          <Suspense fallback={<HomeFeedSkeleton count={2} />}>
            <HomeFeedSection
              member={member}
              userId={user?.id}
              showSectionHeader={Boolean(member)}
            />
          </Suspense>
          <SeoFooterLinks />
        </div>
      </main>
    </>
  );
}
