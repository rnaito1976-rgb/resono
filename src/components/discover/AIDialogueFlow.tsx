"use client";

import { useMemo, useState, useTransition } from "react";
import { PageBackLink } from "@/components/navigation/PageBackLink";
import {
  completeDialogueOnboardingAction,
  completeDiscoverDialogueAction,
  saveFrequencyColorAction,
} from "@/lib/actions/onboarding";
import { FrequencyColorPicker } from "@/components/frequency-color/FrequencyColorPicker";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import {
  DISCOVER_DIALOGUE_STEPS,
  INITIAL_DIALOGUE_STEPS,
  isDialogueAnswersComplete,
  mergeDialogueAnswers,
  type DialogueAnswers,
  type DialogueStep,
} from "@/lib/resonance/dialogue";
import { ChipGrid } from "@/components/onboarding/SelectableChip";
import { FrequencySpinner } from "@/components/frequency-color/FrequencySpinner";
import { Button } from "@/components/ui/button";

type AIDialogueFlowProps = {
  memberId: string;
  mode: "onboarding" | "discover";
  initialPhase?: "dialogue" | "frequency";
};

type OnboardingPhase = "dialogue" | "frequency";

type DiscoverAnswers = {
  artists: string[];
  tempo: string;
  values: string[];
};

export function AIDialogueFlow({
  memberId,
  mode,
  initialPhase = "dialogue",
}: AIDialogueFlowProps) {
  const steps = mode === "onboarding" ? INITIAL_DIALOGUE_STEPS : DISCOVER_DIALOGUE_STEPS;
  const [phase, setPhase] = useState<OnboardingPhase>(
    mode === "onboarding" ? initialPhase : "dialogue"
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<DialogueAnswers>>({});
  const [discoverAnswers, setDiscoverAnswers] = useState<DiscoverAnswers>({
    artists: [],
    tempo: "",
    values: [],
  });
  const [selection, setSelection] = useState<string[]>([]);
  const [textValue, setTextValue] = useState("");
  const [customArtist, setCustomArtist] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const step = steps[stepIndex];
  const history = useMemo(() => steps.slice(0, stepIndex), [stepIndex, steps]);

  function toggleSelection(value: string, stepDef: DialogueStep) {
    if (stepDef.type === "single") {
      setSelection([value]);
      return;
    }

    if (stepDef.type === "multi") {
      setSelection((current) => {
        if (current.includes(value)) {
          return current.filter((item) => item !== value);
        }

        if (stepDef.max && current.length >= stepDef.max) {
          return current;
        }

        return [...current, value];
      });
    }
  }

  function addCustomArtist() {
    const trimmed = customArtist.trim();
    if (!trimmed || selection.includes(trimmed)) {
      return;
    }

    setSelection((current) => {
      if (step?.type === "multi" && step.max && current.length >= step.max) {
        return current;
      }
      return [...current, trimmed];
    });
    setCustomArtist("");
  }

  function canProceed(currentStep: DialogueStep): boolean {
    if (currentStep.type === "text") {
      return textValue.trim().length >= 1;
    }

    if (currentStep.type === "single") {
      return selection.length === 1;
    }

    if (currentStep.max) {
      return (
        selection.length >= currentStep.min && selection.length <= currentStep.max
      );
    }

    return selection.length >= currentStep.min;
  }

  function handleNext() {
    if (!step || !canProceed(step)) {
      return;
    }

    setError(null);

    if (mode === "discover") {
      handleDiscoverNext();
      return;
    }

    let value: string | string[] = selection;
    if (step.type === "text") {
      value = textValue.trim();
    }

    const nextAnswers = mergeDialogueAnswers(answers, step.id, value);
    setAnswers(nextAnswers);
    setSelection([]);
    setTextValue("");
    setCustomArtist("");

    if (stepIndex === steps.length - 1) {
      if (!isDialogueAnswersComplete(nextAnswers)) {
        setError("対話が完了していません");
        return;
      }

      startTransition(async () => {
        const result = await completeDialogueOnboardingAction(nextAnswers);
        if (result?.error) {
          setError(result.error);
          return;
        }

        setAnswers(nextAnswers);
        setPhase("frequency");
      });
      return;
    }

    setStepIndex((current) => current + 1);
  }

  function handleDiscoverNext() {
    const nextDiscover = { ...discoverAnswers };

    if (step?.id === "artists") {
      nextDiscover.artists = selection;
    } else if (step?.id === "weekend") {
      nextDiscover.tempo = selection[0] ?? "";
    } else if (step?.id === "values") {
      nextDiscover.values = selection;
    }

    setDiscoverAnswers(nextDiscover);
    setSelection([]);
    setCustomArtist("");

    if (stepIndex === steps.length - 1) {
      startTransition(async () => {
        const result = await completeDiscoverDialogueAction(nextDiscover);

        if (result?.error) {
          setError(result.error);
        } else {
          window.location.href = "/";
        }
      });
      return;
    }

    setStepIndex((current) => current + 1);
  }

  if (mode === "onboarding" && phase === "frequency") {
    return (
      <FrequencyColorPicker
        onConfirm={async (color: FrequencyColorHex) => {
          const result = await saveFrequencyColorAction(color);
          if (result?.error) {
            return { error: result.error };
          }

          window.location.href = "/";
        }}
        submitLabel="Resonoをはじめる"
      />
    );
  }

  const backHref = mode === "discover" ? `/member/${memberId}` : "/";

  if (!step) {
    return null;
  }

  return (
    <div
      className={`mx-auto flex min-h-dvh w-full max-w-mobile flex-col bg-black px-5 pb-8 ${
        mode === "discover" ? "pt-6" : "pt-12"
      }`}
    >
      {mode === "discover" ? (
        <header className="mb-6 flex items-center">
          <PageBackLink href={backHref} label="戻る" />
        </header>
      ) : null}

      <div className="mb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          Resono AI
        </p>
        <h1 className="mt-3 text-[28px] font-light tracking-tight text-white">
          {mode === "onboarding" ? "短い対話からはじめる" : "もう少し教える"}
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-white/45">
          {mode === "onboarding"
            ? "ニックネームとパート、ジャンル、5つの質問だけ。あとはAIがあなたの音楽的な輪郭を読み取ります。"
            : "続けて話すほど、一緒に音楽を続けられそうな人との距離感が近づきます。"}
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pb-6">
        {history.map((pastStep, index) => (
          <DialogueTurn key={`${pastStep.id}-${index}`} message={pastStep.message} />
        ))}

        <DialogueTurn message={step.message} active />

        {step.type === "text" ? (
          <div className="pl-8">
            <input
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
              placeholder={step.placeholder}
              className="h-12 w-full rounded-full border border-border bg-white/[0.04] px-5 text-[15px] text-white outline-none placeholder:text-white/30 focus:border-border"
            />
          </div>
        ) : (
          <div className="space-y-5 pl-8">
            <ChipGrid
              items={step.options}
              selected={selection}
              onToggle={(value) => toggleSelection(value, step)}
            />

            {step.id === "artists" && mode === "discover" ? (
              <div className="flex gap-2">
                <input
                  value={customArtist}
                  onChange={(event) => setCustomArtist(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addCustomArtist();
                    }
                  }}
                  placeholder="自由入力"
                  className="h-11 flex-1 rounded-full border border-border bg-white/[0.04] px-4 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-border"
                />
                <Button type="button" variant="outline" size="sm" onClick={addCustomArtist}>
                  追加
                </Button>
              </div>
            ) : null}

            {step.id === "genres" ? (
              <p className="text-[13px] text-white/40">
                {selection.length} / 5 選択中（3つ以上）
              </p>
            ) : null}
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-border pt-5">
        {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
        <Button
          size="lg"
          className="w-full"
          disabled={!canProceed(step) || isPending}
          onClick={handleNext}
        >
          {isPending
            ? (
              <span className="inline-flex items-center gap-2">
                <FrequencySpinner size={16} />
                考えています...
              </span>
            )
            : stepIndex === steps.length - 1
              ? mode === "onboarding"
                ? "Resonoをはじめる"
                : "ホームへ戻る"
              : "次へ"}
        </Button>
      </div>
    </div>
  );
}

function DialogueTurn({
  message,
  active = false,
}: {
  message: string;
  active?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-medium text-primary">
        AI
      </div>
      <div
        className={`max-w-[82%] rounded-[22px] px-4 py-3 text-[15px] leading-relaxed ${
          active
            ? "border border-border bg-white/[0.05] text-white"
            : "bg-white/[0.03] text-white/55"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
