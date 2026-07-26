"use client";

import { useMemo, useState, useTransition } from "react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { OnboardingPhotoPicker } from "@/components/onboarding/OnboardingPhotoPicker";
import { FrequencyColorPicker } from "@/components/frequency-color/FrequencyColorPicker";
import { ChipGrid } from "@/components/onboarding/SelectableChip";
import { FrequencySpinner } from "@/components/frequency-color/FrequencySpinner";
import { Button } from "@/components/ui/button";
import {
  completeMinimalRegistrationAction,
  saveFrequencyColorAction,
} from "@/lib/actions/onboarding";
import { NO_PHOTO_URL, hasCustomPhotoUrl } from "@/lib/onboarding/status";
import { PLAYING_PART_OPTIONS, SUGGESTED_ARTISTS } from "@/lib/resonance/dialogue";
import { isValidFrequencyColor } from "@/lib/frequency-color/palette";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import type { MinimalRegistrationInput } from "@/lib/profile/registration";
import {
  effectiveWelcomeParts,
  readValidWelcomeOnboardingAnswers,
} from "@/lib/welcome/onboarding-registration";
import { clearWelcomeOnboardingAnswers } from "@/lib/welcome/onboarding-storage";
import type { WelcomeOnboardingAnswers } from "@/types/welcome-onboarding";
import { WELCOME_ARTIST_MAX } from "@/types/welcome-onboarding";

type MinimalRegistrationFlowProps = {
  memberId: string;
  initialPhase?: "registration" | "frequency";
};

type RegistrationStep = "photo" | "name" | "part" | "artists";

const DEFAULT_STEPS: RegistrationStep[] = ["photo", "name", "part", "artists"];

export function MinimalRegistrationFlow({
  memberId,
  initialPhase = "registration",
}: MinimalRegistrationFlowProps) {
  const welcomeAnswers = useMemo(() => readValidWelcomeOnboardingAnswers(), []);
  const steps = welcomeAnswers ? (["photo", "name"] as RegistrationStep[]) : DEFAULT_STEPS;

  const [phase, setPhase] = useState<"registration" | "frequency">(initialPhase);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<Partial<MinimalRegistrationInput>>({
    photo: undefined,
    name: "",
    part: "",
    favoriteArtists: [],
  });
  const [photoSkipped, setPhotoSkipped] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [partSelection, setPartSelection] = useState<string[]>([]);
  const [artistSelection, setArtistSelection] = useState<string[]>([]);
  const [customArtist, setCustomArtist] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const step = steps[stepIndex];

  useScrollToTop(`${phase}:${stepIndex}`);

  function toggleArtist(value: string) {
    setArtistSelection((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value);
      }
      if (current.length >= WELCOME_ARTIST_MAX) {
        return current;
      }
      return [...current, value];
    });
  }

  function addCustomArtist() {
    const trimmed = customArtist.trim();
    if (!trimmed || artistSelection.includes(trimmed) || artistSelection.length >= WELCOME_ARTIST_MAX) {
      return;
    }
    setArtistSelection((current) => [...current, trimmed]);
    setCustomArtist("");
  }

  function buildRegistrationInput(
    welcome: WelcomeOnboardingAnswers | null
  ): Partial<MinimalRegistrationInput> {
    if (welcome) {
      const parts = effectiveWelcomeParts(welcome.parts);
      return {
        ...form,
        name: nameInput.trim(),
        photo: photoSkipped ? NO_PHOTO_URL : form.photo ?? NO_PHOTO_URL,
        part: parts[0] ?? "",
        parts,
        favoriteArtists: welcome.artists,
        sounds: welcome.sounds,
      };
    }

    return {
      ...form,
      name: nameInput.trim(),
      photo: photoSkipped ? NO_PHOTO_URL : form.photo ?? NO_PHOTO_URL,
      part: partSelection[0] ?? "",
      favoriteArtists: artistSelection,
    };
  }

  function canProceed(): boolean {
    switch (step) {
      case "photo":
        return hasCustomPhotoUrl(form.photo ?? "") || photoSkipped;
      case "name":
        return nameInput.trim().length >= 1;
      case "part":
        return partSelection.length === 1;
      case "artists":
        return artistSelection.length >= 1;
      default:
        return false;
    }
  }

  function submitRegistration(welcome: WelcomeOnboardingAnswers | null) {
    const nextForm = buildRegistrationInput(welcome);

    startTransition(async () => {
      const result = await completeMinimalRegistrationAction(nextForm);
      if (result.error) {
        setError(result.error);
        return;
      }

      const savedColor = welcome?.frequencyColor;
      if (savedColor && isValidFrequencyColor(savedColor)) {
        const colorResult = await saveFrequencyColorAction(savedColor);
        if (colorResult?.error) {
          setError(colorResult.error);
          return;
        }

        clearWelcomeOnboardingAnswers();
        window.location.href = "/";
        return;
      }

      if (welcome) {
        clearWelcomeOnboardingAnswers();
      }

      setForm(nextForm);
      setPhase("frequency");
    });
  }

  function handleNext() {
    if (!canProceed()) {
      return;
    }

    setError(null);

    if (step === "name") {
      setForm((current) => ({ ...current, name: nameInput.trim() }));
    }

    if (step === "part") {
      setForm((current) => ({ ...current, part: partSelection[0] ?? "" }));
    }

    if (step === "name" && welcomeAnswers) {
      submitRegistration(welcomeAnswers);
      return;
    }

    if (step === "artists") {
      submitRegistration(null);
      return;
    }

    setStepIndex((current) => current + 1);
  }

  if (phase === "frequency") {
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

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-mobile flex-col bg-black px-5 pb-8 pt-12">
      <div className="mb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          Welcome
        </p>
        <h1 className="mt-3 text-[28px] font-light tracking-tight text-white">
          プロフィールのはじまり
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-white/45">
          {welcomeAnswers
            ? "Welcomeで選んだ内容はプロフィールに引き継がれます。名前と写真だけ決めましょう。"
            : "最初は最低限だけ。あとはAIとの会話で、少しずつ育てていきます。"}
        </p>
        <p className="mt-4 text-[12px] uppercase tracking-[0.18em] text-white/30">
          Step {stepIndex + 1} / {steps.length}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {step === "photo" ? (
          <OnboardingPhotoPicker
            memberId={memberId}
            value={form.photo}
            skipped={photoSkipped}
            onChange={(url) => {
              setPhotoSkipped(false);
              setForm((current) => ({ ...current, photo: url }));
            }}
            onSkip={() => {
              setPhotoSkipped(true);
              setForm((current) => ({ ...current, photo: NO_PHOTO_URL }));
            }}
          />
        ) : null}

        {step === "name" ? (
          <div className="space-y-4 pt-4">
            <label className="block text-[15px] text-white/70">名前</label>
            <input
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              placeholder="ニックネーム"
              className="h-12 w-full rounded-full border border-border bg-white/[0.04] px-5 text-[15px] text-white outline-none placeholder:text-white/30 focus:border-border"
            />
            {welcomeAnswers ? (
              <div className="rounded-2xl border border-border bg-white/[0.03] px-4 py-4 text-[13px] leading-relaxed text-white/45">
                <p>引き継ぐ内容</p>
                <p className="mt-2 text-white/70">
                  アーティスト {welcomeAnswers.artists.length}組 · パート{" "}
                  {effectiveWelcomeParts(welcomeAnswers.parts).join(" · ")} · ジャンル{" "}
                  {welcomeAnswers.sounds.length > 0
                    ? welcomeAnswers.sounds.slice(0, 3).join(" · ")
                    : "未選択"}
                  {welcomeAnswers.frequencyColor ? " · カラー選択済み" : null}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === "part" ? (
          <div className="space-y-4 pt-2">
            <p className="text-[15px] text-white/70">担当パート</p>
            <ChipGrid
              items={PLAYING_PART_OPTIONS}
              selected={partSelection}
              onToggle={(value) => setPartSelection([value])}
            />
          </div>
        ) : null}

        {step === "artists" ? (
          <div className="space-y-5 pt-2">
            <p className="text-[15px] text-white/70">好きなアーティストを選んでください</p>
            <ChipGrid
              items={SUGGESTED_ARTISTS}
              selected={artistSelection}
              onToggle={toggleArtist}
            />
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
            <p className="text-[13px] text-white/40">{artistSelection.length} 組選択中</p>
          </div>
        ) : null}
      </div>

      <div className="space-y-3 border-t border-border pt-5">
        {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
        <Button
          size="lg"
          className="w-full"
          disabled={!canProceed() || isPending}
          onClick={handleNext}
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <FrequencySpinner size={16} />
              保存中...
            </span>
          ) : step === "name" && welcomeAnswers ? (
            welcomeAnswers.frequencyColor ? "Resonoをはじめる" : "次へ（カラー選択）"
          ) : step === "artists" ? (
            "次へ（カラー選択）"
          ) : (
            "次へ"
          )}
        </Button>
      </div>
    </div>
  );
}
