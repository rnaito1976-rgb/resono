"use client";

import { useEffect } from "react";
import { FrequencyColorSwatchGrid } from "@/components/frequency-color/FrequencyColorSwatchGrid";
import { WelcomeProgress } from "@/components/welcome/WelcomeProgress";
import { applyFrequencyColorVariables } from "@/lib/frequency-color/css";
import { WELCOME_COLOR_QUESTION } from "@/lib/welcome/onboarding-data";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { withAlpha } from "@/lib/frequency-color/utils";
import { Button } from "@/components/ui/button";

type WelcomeColorStepViewProps = {
  selected?: FrequencyColorHex;
  onChange: (color: FrequencyColorHex) => void;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
};

export function WelcomeColorStepView({
  selected,
  onChange,
  onBack,
  onNext,
  canProceed,
}: WelcomeColorStepViewProps) {
  useEffect(() => {
    if (selected) {
      applyFrequencyColorVariables(document.documentElement, selected);
    }
  }, [selected]);

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="px-5 pb-4 pt-5">
        <WelcomeProgress current="color" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5 pb-36 pt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          Welcome
        </p>
        <h2 className="mt-1 text-[28px] font-light leading-[1.25] tracking-tight">
          {WELCOME_COLOR_QUESTION.title}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-white/45">
          {WELCOME_COLOR_QUESTION.subtitle}
        </p>

        <div className="mt-10 flex flex-1 flex-col justify-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-white/[0.04]">
            <div
              className="h-14 w-14 rounded-full transition-quiet"
              style={{
                backgroundColor: selected ?? "rgba(255,255,255,0.08)",
                boxShadow: selected
                  ? `0 0 0 1px ${withAlpha(selected, 0.35)}, 0 0 32px ${withAlpha(selected, 0.28)}`
                  : undefined,
              }}
            />
          </div>

          <FrequencyColorSwatchGrid selected={selected} onSelect={onChange} columns={4} />
        </div>
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent" />
        <div className="relative mx-auto w-full max-w-mobile space-y-4 px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-4">
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
      </footer>
    </div>
  );
}
