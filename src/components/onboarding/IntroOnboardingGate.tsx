"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { useIntroOnboarding } from "@/hooks/useIntroOnboarding";
import {
  INTRO_ONBOARDING_PREVIEW_PARAM,
  isIntroOnboardingPreviewEnabled,
} from "@/lib/onboarding/intro-onboarding";

type IntroOnboardingGateProps = {
  initialVisible: boolean;
  userId: string | null;
};

function IntroOnboardingGateContent({
  initialVisible,
  userId,
}: IntroOnboardingGateProps) {
  const searchParams = useSearchParams();
  const previewMode = isIntroOnboardingPreviewEnabled(
    searchParams.get(INTRO_ONBOARDING_PREVIEW_PARAM)
  );

  const { visible, steps, complete, isPending, error } = useIntroOnboarding({
    initialVisible,
    userId,
    previewMode,
  });

  return (
    <OnboardingModal
      open={visible}
      steps={steps}
      onComplete={complete}
      isPending={isPending}
      error={error}
    />
  );
}

export function IntroOnboardingGate(props: IntroOnboardingGateProps) {
  return (
    <Suspense fallback={null}>
      <IntroOnboardingGateContent {...props} />
    </Suspense>
  );
}
