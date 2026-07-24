"use client";

import { useState, useTransition } from "react";
import { OnboardingPhotoPicker } from "@/components/onboarding/OnboardingPhotoPicker";
import { FrequencyColorPicker } from "@/components/frequency-color/FrequencyColorPicker";
import { ChipGrid } from "@/components/onboarding/SelectableChip";
import { FrequencySpinner } from "@/components/frequency-color/FrequencySpinner";
import { Button } from "@/components/ui/button";
import {
  completeMinimalRegistrationAction,
  saveFrequencyColorAction,
} from "@/lib/actions/onboarding";
import { hasCustomPhotoUrl } from "@/lib/onboarding/status";
import { PLAYING_PART_OPTIONS, SUGGESTED_ARTISTS } from "@/lib/resonance/dialogue";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import type { MinimalRegistrationInput } from "@/lib/profile/registration";

type MinimalRegistrationFlowProps = {
  memberId: string;
  initialPhase?: "registration" | "frequency";
};

type RegistrationStep = "photo" | "name" | "part" | "artists";

const STEPS: RegistrationStep[] = ["photo", "name", "part", "artists"];

export function MinimalRegistrationFlow({
  memberId,
  initialPhase = "registration",
}: MinimalRegistrationFlowProps) {
  const [phase, setPhase] = useState<"registration" | "frequency">(initialPhase);
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<Partial<MinimalRegistrationInput>>({
    photo: "",
    name: "",
    part: "",
    favoriteArtists: [],
  });
  const [nameInput, setNameInput] = useState("");
  const [partSelection, setPartSelection] = useState<string[]>([]);
  const [artistSelection, setArtistSelection] = useState<string[]>([]);
  const [customArtist, setCustomArtist] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const step = STEPS[stepIndex];

  function toggleArtist(value: string) {
    setArtistSelection((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value);
      }
      if (current.length >= 3) {
        return current;
      }
      return [...current, value];
    });
  }

  function addCustomArtist() {
    const trimmed = customArtist.trim();
    if (!trimmed || artistSelection.includes(trimmed) || artistSelection.length >= 3) {
      return;
    }
    setArtistSelection((current) => [...current, trimmed]);
    setCustomArtist("");
  }

  function canProceed(): boolean {
    switch (step) {
      case "photo":
        return Boolean(form.photo && hasCustomPhotoUrl(form.photo));
      case "name":
        return nameInput.trim().length >= 1;
      case "part":
        return partSelection.length === 1;
      case "artists":
        return artistSelection.length === 3;
      default:
        return false;
    }
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

    if (step === "artists") {
      const nextForm: Partial<MinimalRegistrationInput> = {
        ...form,
        favoriteArtists: artistSelection,
      };

      startTransition(async () => {
        const result = await completeMinimalRegistrationAction(nextForm);
        if (result.error) {
          setError(result.error);
          return;
        }
        setForm(nextForm);
        setPhase("frequency");
      });
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
          最初は最低限だけ。あとはAIとの会話で、少しずつ育てていきます。
        </p>
        <p className="mt-4 text-[12px] uppercase tracking-[0.18em] text-white/30">
          Step {stepIndex + 1} / {STEPS.length}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {step === "photo" ? (
          <OnboardingPhotoPicker
            memberId={memberId}
            value={form.photo ?? ""}
            onChange={(url) => setForm((current) => ({ ...current, photo: url }))}
            required
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
            <p className="text-[15px] text-white/70">好きなアーティストを3組選んでください</p>
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
            <p className="text-[13px] text-white/40">{artistSelection.length} / 3 選択中</p>
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
