import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { HomeFeedSection } from "@/components/home/HomeFeedSection";
import { HomeFeedSkeleton } from "@/components/skeletons/HomeFeedSkeleton";
import { getViewerContext } from "@/lib/members/viewer-context";
import { getHomeLcpImageHref } from "@/lib/images/lcp";
import { isOnboardingComplete } from "@/lib/onboarding/status";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { user, member: currentMember, frequencyColor } = await getViewerContext();

  if (
    user &&
    currentMember &&
    !isOnboardingComplete({
      ...currentMember,
      frequencyColor: currentMember.frequencyColor ?? frequencyColor,
    })
  ) {
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
        <Suspense fallback={<HomeFeedSkeleton count={4} />}>
          <HomeFeedSection
            viewerId={currentMember?.id ?? user?.id}
            currentMember={currentMember}
            userId={user?.id}
          />
        </Suspense>
      </main>
    </>
  );
}
