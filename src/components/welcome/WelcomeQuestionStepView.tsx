"use client";

import { WelcomeArtistPicker } from "@/components/welcome/WelcomeArtistPicker";
import { WelcomePartsPicker } from "@/components/welcome/WelcomePartsPicker";
import { WelcomeProgress } from "@/components/welcome/WelcomeProgress";
import { WelcomeTagMultiPicker } from "@/components/welcome/WelcomeTagMultiPicker";
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
    <div className="flex min-h-dvh flex-col px-5 pb-10 pt-6">
      <WelcomeProgress current={step} />

      <div className="flex flex-1 flex-col py-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          Welcome
        </p>
        <h2 className="mt-1 text-[28px] font-light leading-[1.25] tracking-tight">
          {config.title}
        </h2>
        {config.subtitle ? (
          <p className="mt-3 text-[15px] leading-relaxed text-white/45">{config.subtitle}</p>
        ) : null}

        <div className="mt-8 min-h-0 flex-1">
          {config.kind === "artists" ? (
            <WelcomeArtistPicker selected={selected} onChange={onChange} />
          ) : null}

          {config.kind === "parts" ? (
            <WelcomePartsPicker selected={selected} onChange={onChange} />
          ) : null}

          {config.kind === "sounds" ? (
            <WelcomeTagMultiPicker
              presets={config.presets}
              selected={selected}
              placeholder={config.placeholder ?? "検索"}
              onChange={onChange}
            />
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        <Button
          type="button"
          size="lg"
          className="h-12 w-full rounded-full text-[15px]"
          disabled={!canProceed}
          onClick={onNext}
        >
          次へ
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="mx-auto block text-[15px] text-white/45 transition-quiet active:opacity-70"
        >
          戻る
        </button>
      </div>
    </div>
  );
}
