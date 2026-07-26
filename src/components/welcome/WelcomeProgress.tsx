"use client";

import { cn } from "@/lib/utils";
import { WELCOME_QUESTION_STEPS } from "@/types/welcome-onboarding";
import type { WelcomeQuestionStep } from "@/types/welcome-onboarding";

type WelcomeProgressProps = {
  current: WelcomeQuestionStep;
};

export function WelcomeProgress({ current }: WelcomeProgressProps) {
  const currentIndex = WELCOME_QUESTION_STEPS.indexOf(current);

  return (
    <div
      className="flex items-center justify-center gap-1.5"
      aria-label={`${currentIndex + 1} / ${WELCOME_QUESTION_STEPS.length}`}
    >
      {WELCOME_QUESTION_STEPS.map((step, index) => (
        <span
          key={step}
          className={cn(
            "block h-1.5 w-1.5 rounded-full transition-quiet",
            index <= currentIndex ? "bg-primary" : "bg-white/20"
          )}
        />
      ))}
    </div>
  );
}
