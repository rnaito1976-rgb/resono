"use client";

import { useMemo, useState, useTransition } from "react";
import {
  completeDialogueOnboardingAction,
  completeDiscoverDialogueAction,
} from "@/lib/actions/onboarding";
import { DEFAULT_PHOTO_URL } from "@/lib/onboarding/status";
import {
  DISCOVER_DIALOGUE_STEPS,
  INITIAL_DIALOGUE_STEPS,
  isDialogueAnswersComplete,
  mergeDialogueAnswers,
  type DialogueAnswers,
  type DialogueStep,
} from "@/lib/resonance/dialogue";
import { OnboardingPhotoPicker } from "@/components/onboarding/OnboardingPhotoPicker";
import { ChipGrid } from "@/components/onboarding/SelectableChip";
import { Button } from "@/components/ui/button";

type AIDialogueFlowProps = {
  memberId: string;
  mode: "onboarding" | "discover";
  initialPhoto?: string;
};

type DiscoverAnswers = {
  media: string[];
  tempo: string;
  venues: string[];
};

export function AIDialogueFlow({
  memberId,
  mode,
  initialPhoto = DEFAULT_PHOTO_URL,
}: AIDialogueFlowProps) {
  const steps = mode === "onboarding" ? INITIAL_DIALOGUE_STEPS : DISCOVER_DIALOGUE_STEPS;
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<DialogueAnswers>>({
    photo: initialPhoto,
  });
  const [discoverAnswers, setDiscoverAnswers] = useState<DiscoverAnswers>({
    media: [],
    tempo: "",
    venues: [],
  });
  const [selection, setSelection] = useState<string[]>([]);
  const [customArtist, setCustomArtist] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const step = steps[stepIndex];
  const history = useMemo(() => steps.slice(0, stepIndex), [stepIndex, steps]);

  function toggleSelection(value: string, type: "single" | "multi") {
    if (type === "single") {
      setSelection([value]);
      return;
    }

    setSelection((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  function addCustomArtist() {
    const trimmed = customArtist.trim();
    if (!trimmed || selection.includes(trimmed)) {
      return;
    }

    setSelection((current) => [...current, trimmed]);
    setCustomArtist("");
  }

  function canProceed(currentStep: DialogueStep): boolean {
    if (currentStep.type === "photo") {
      return true;
    }

    if (currentStep.type === "single") {
      return selection.length === 1;
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
    if (step.type === "photo") {
      value = answers.photo ?? initialPhoto;
    }

    const nextAnswers = mergeDialogueAnswers(answers, step.id, value);
    setAnswers(nextAnswers);
    setSelection([]);
    setCustomArtist("");

    if (stepIndex === steps.length - 1) {
      startTransition(async () => {
        const payload = {
          ...nextAnswers,
          photo: nextAnswers.photo ?? initialPhoto,
        };

        if (!isDialogueAnswersComplete(payload)) {
          setError("対話が完了していません");
          return;
        }

        const result = await completeDialogueOnboardingAction(payload);
        if (result?.error) {
          setError(result.error);
          return;
        }

        if (result?.success) {
          window.location.href = "/";
        }
      });
      return;
    }

    setStepIndex((current) => current + 1);
  }

  function handleDiscoverNext() {
    const nextDiscover = { ...discoverAnswers };

    if (stepIndex === 0) {
      nextDiscover.media = selection;
    } else if (stepIndex === 1) {
      nextDiscover.tempo = selection[0] ?? "";
    } else if (stepIndex === 2) {
      nextDiscover.venues = selection;
    }

    setDiscoverAnswers(nextDiscover);
    setSelection([]);
    setCustomArtist("");

    if (stepIndex === steps.length - 1) {
      startTransition(async () => {
        const result = await completeDiscoverDialogueAction({
          media: nextDiscover.media,
          tempo: nextDiscover.tempo,
          venues: nextDiscover.venues,
        });

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

  if (!step) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-mobile flex-col bg-black px-5 pb-8 pt-12">
      <div className="mb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          Resono AI
        </p>
        <h1 className="mt-3 text-[28px] font-light tracking-tight text-white">
          {mode === "onboarding" ? "短い対話からはじめる" : "もう少し教える"}
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-white/45">
          {mode === "onboarding"
            ? "3つの質問だけ。あとはAIが世界観を読み取り、利用中に少しずつ精度を高めます。"
            : "続けて話すほど、共鳴する人との距離感が近づきます。いつでもスキップできます。"}
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pb-6">
        {history.map((pastStep, index) => (
          <DialogueTurn key={`${pastStep.id}-${index}`} message={pastStep.message} />
        ))}

        <DialogueTurn message={step.message} active />

        {step.type === "photo" ? (
          <OnboardingPhotoPicker
            memberId={memberId}
            value={answers.photo ?? initialPhoto}
            onChange={(url) => setAnswers((current) => ({ ...current, photo: url }))}
          />
        ) : (
          <div className="space-y-5 pl-8">
            <ChipGrid
              items={step.options}
              selected={selection}
              onToggle={(value) =>
                toggleSelection(value, step.type === "single" ? "single" : "multi")
              }
            />

            {step.id === "artists" && mode === "onboarding" ? (
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
                  className="h-11 flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-white/25"
                />
                <Button type="button" variant="outline" size="sm" onClick={addCustomArtist}>
                  追加
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-white/8 pt-5">
        {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
        <Button
          size="lg"
          className="w-full"
          disabled={!canProceed(step) || isPending}
          onClick={handleNext}
        >
          {isPending
            ? "考えています..."
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
            ? "border border-white/10 bg-white/[0.05] text-white"
            : "bg-white/[0.03] text-white/55"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
