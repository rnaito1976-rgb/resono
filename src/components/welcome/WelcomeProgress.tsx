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
    <div className="flex items-center gap-2 px-1" aria-label="進捗">
      {WELCOME_QUESTION_STEPS.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <span
            className={cn(
              "block h-2.5 w-2.5 rounded-full transition-quiet",
              index <= currentIndex ? "bg-primary" : "bg-border"
            )}
          />
          {index < WELCOME_QUESTION_STEPS.length - 1 ? (
            <span
              className={cn(
                "block h-0.5 w-8 rounded-full transition-quiet sm:w-10",
                index < currentIndex ? "bg-primary/70" : "bg-border"
              )}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
