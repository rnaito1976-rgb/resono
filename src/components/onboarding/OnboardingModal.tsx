"use client";

import { AuthLogo } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import type { IntroOnboardingStep } from "@/lib/onboarding/intro-onboarding";

type OnboardingModalProps = {
  open: boolean;
  steps: IntroOnboardingStep[];
  onComplete: () => void;
  isPending?: boolean;
  error?: string | null;
};

export function OnboardingModal({
  open,
  steps,
  onComplete,
  isPending = false,
  error = null,
}: OnboardingModalProps) {
  if (!open || steps.length === 0) {
    return null;
  }

  const step = steps[0];

  return (
    <div
      className="fixed inset-0 z-[100] flex animate-onboarding-fade-in flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-onboarding-title"
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-mobile flex-1 flex-col px-8 pb-10 pt-[max(3.5rem,env(safe-area-inset-top))]">
        <header className="flex shrink-0 justify-center pt-6">
          <div id="intro-onboarding-title">
            <AuthLogo />
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <div className="space-y-8">
            {step.paragraphs.map((paragraph, index) => (
              <p
                key={`${step.id}-${index}`}
                className="whitespace-pre-line text-[15px] font-light leading-[1.9] tracking-[0.06em] text-white/70"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {error ? (
            <p className="mt-8 text-[14px] text-red-400/90" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            className="h-12 w-full text-[15px] font-medium tracking-wide"
            disabled={isPending}
            onClick={onComplete}
          >
            {step.ctaLabel}
          </Button>
        </footer>
      </div>
    </div>
  );
}
