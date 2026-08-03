"use client";

import Link from "next/link";
import { Suspense } from "react";
import { X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useIntroOnboarding } from "@/hooks/useIntroOnboarding";
import {
  INTRO_ONBOARDING_PREVIEW_PARAM,
  isIntroOnboardingPreviewEnabled,
} from "@/lib/onboarding/intro-onboarding";
import { cn } from "@/lib/utils";

type IntroOnboardingCardsProps = {
  initialVisible: boolean;
  userId: string | null;
};

function IntroOnboardingCardsContent({
  initialVisible,
  userId,
}: IntroOnboardingCardsProps) {
  const searchParams = useSearchParams();
  const previewMode = isIntroOnboardingPreviewEnabled(
    searchParams.get(INTRO_ONBOARDING_PREVIEW_PARAM)
  );

  const { visible, steps, dismiss, isPending, error } = useIntroOnboarding({
    initialVisible,
    userId,
    previewMode,
  });

  if (!visible || steps.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <article
          key={step.id}
          className="animate-onboarding-fade-in relative overflow-hidden rounded-[28px] border border-primary/20 bg-gradient-to-b from-primary/[0.08] to-white/[0.02] px-5 py-5"
        >
          <button
            type="button"
            onClick={dismiss}
            disabled={isPending}
            aria-label="閉じる"
            className="absolute right-4 top-4 flex h-9 w-9 touch-manipulation items-center justify-center rounded-full text-white/45 transition-quiet hover:bg-white/[0.06] hover:text-white/70 active:opacity-80 disabled:opacity-40"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>

          <div className="space-y-4 pr-10">
            {step.paragraphs.map((paragraph, index) => (
              <p
                key={`${step.id}-${index}`}
                className={cn(
                  "whitespace-pre-line text-[15px] font-light leading-[1.85] tracking-[0.04em]",
                  index === 0 ? "text-white/90" : "text-white/60"
                )}
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-4">
            <Link
              href="/discover"
              className="text-[14px] text-primary transition-quiet active:opacity-80"
            >
              Discover を見る
            </Link>
          </div>

          {error ? (
            <p className="mt-4 text-[13px] text-red-400/90" role="alert">
              {error}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function IntroOnboardingCards(props: IntroOnboardingCardsProps) {
  return (
    <Suspense fallback={null}>
      <IntroOnboardingCardsContent {...props} />
    </Suspense>
  );
}
