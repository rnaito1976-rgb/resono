"use client";

import { WelcomeProgress } from "@/components/welcome/WelcomeProgress";
import { WelcomeSearchableOptions } from "@/components/welcome/WelcomeSearchableOptions";
import type { WelcomeQuestionConfig } from "@/lib/welcome/onboarding-data";
import type { WelcomeQuestionStep } from "@/types/welcome-onboarding";
import { Button } from "@/components/ui/button";

type WelcomeQuestionStepViewProps = {
  step: WelcomeQuestionStep;
  config: WelcomeQuestionConfig;
  selected: string[];
  onChange: (next: string[]) => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
};

export function WelcomeQuestionStepView({
  step,
  config,
  selected,
  onChange,
  onBack,
  onNext,
  canProceed,
}: WelcomeQuestionStepViewProps) {
  return (
    <div className="flex min-h-dvh flex-col px-6 pb-10 pt-8">
      <WelcomeProgress current={step} />

      <div className="flex flex-1 flex-col justify-center py-10">
        <p className="text-[34px] leading-none" aria-hidden>
          {config.emoji}
        </p>
        <h2 className="mt-5 text-[28px] font-light leading-[1.25] tracking-tight">
          {config.title}
        </h2>

        <div className="mt-8">
          <WelcomeSearchableOptions
            presets={config.presets}
            selected={selected}
            multi={config.multi}
            searchable={config.searchable}
            placeholder={config.placeholder}
            onChange={onChange}
          />
        </div>
      </div>

      <div className="space-y-4">
        <Button
          type="button"
          size="lg"
          className="h-14 w-full rounded-full text-[17px]"
          disabled={!canProceed}
          onClick={onNext}
        >
          次へ
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="mx-auto block text-[15px] text-muted transition-quiet active:opacity-70"
        >
          戻る
        </button>
      </div>
    </div>
  );
}
