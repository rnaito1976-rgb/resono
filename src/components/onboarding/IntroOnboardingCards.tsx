"use client";

import { X } from "lucide-react";
import { useIntroOnboarding } from "@/hooks/useIntroOnboarding";
import { INTRO_ONBOARDING_MESSAGE } from "@/lib/onboarding/intro-onboarding";

type IntroOnboardingCardsProps = {
  userId: string;
};

export function IntroOnboardingCards({ userId }: IntroOnboardingCardsProps) {
  const { visible, dismiss } = useIntroOnboarding(userId);

  if (!visible) {
    return null;
  }

  return (
    <article className="animate-onboarding-fade-in relative min-h-[88px] rounded-[20px] border border-primary/15 bg-primary/[0.05] px-4 py-4">
      <button
        type="button"
        onClick={dismiss}
        aria-label="閉じる"
        className="absolute right-2 top-2 flex h-8 w-8 touch-manipulation items-center justify-center rounded-full text-white/40 transition-quiet active:opacity-80"
      >
        <X className="h-3.5 w-3.5" strokeWidth={2} />
      </button>

      <div className="pr-8">
        <p className="text-[14px] leading-[1.65] text-white/75">
          {INTRO_ONBOARDING_MESSAGE}
        </p>
      </div>
    </article>
  );
}
