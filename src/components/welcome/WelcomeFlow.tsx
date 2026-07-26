"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { WelcomeAnalysisStep } from "@/components/welcome/WelcomeAnalysisStep";
import { WelcomeColorStepView } from "@/components/welcome/WelcomeColorStepView";
import { WelcomeIntroStep } from "@/components/welcome/WelcomeIntroStep";
import { WelcomeMotion } from "@/components/welcome/WelcomeMotion";
import { WelcomeQuestionStepView } from "@/components/welcome/WelcomeQuestionStepView";
import { WelcomeResultsStep } from "@/components/welcome/WelcomeResultsStep";
import { WelcomeShell } from "@/components/welcome/WelcomeShell";
import {
  analyzeMusicDna,
  pickMatchedMembers,
  renderStars,
} from "@/lib/welcome/onboarding-analysis";
import { WELCOME_QUESTIONS } from "@/lib/welcome/onboarding-data";
import { saveWelcomeOnboardingAnswers } from "@/lib/welcome/onboarding-storage";
import type { Member } from "@/types/member";
import type {
  WelcomeOnboardingAnswers,
  WelcomeQuestionStep,
  WelcomeStep,
} from "@/types/welcome-onboarding";
import {
  WELCOME_ARTIST_MAX,
  WELCOME_ARTIST_MIN,
} from "@/types/welcome-onboarding";

const INITIAL_ANSWERS: WelcomeOnboardingAnswers = {
  artists: [],
  parts: [],
  sounds: [],
};

type WelcomeFlowProps = {
  initialUser?: User | null;
  members: Member[];
};

function getPreviousStep(step: WelcomeStep): WelcomeStep {
  switch (step) {
    case "artists":
      return "intro";
    case "parts":
      return "artists";
    case "sounds":
      return "parts";
    case "color":
      return "sounds";
    default:
      return "intro";
  }
}

function getNextQuestionStep(step: WelcomeQuestionStep): WelcomeStep {
  switch (step) {
    case "artists":
      return "parts";
    case "parts":
      return "sounds";
    case "sounds":
      return "color";
    case "color":
      return "analysis";
  }
}

function effectiveParts(parts: string[]): string[] {
  return parts.filter((part) => part !== "Other");
}

export function WelcomeFlow({ initialUser = null, members }: WelcomeFlowProps) {
  const [step, setStep] = useState<WelcomeStep>("intro");
  const [answers, setAnswers] = useState<WelcomeOnboardingAnswers>(INITIAL_ANSWERS);

  const musicDna = useMemo(() => analyzeMusicDna(answers), [answers]);
  const matchedMembers = useMemo(
    () => pickMatchedMembers(members, answers, 3),
    [answers, members]
  );

  const handleAnalysisComplete = useCallback(() => {
    saveWelcomeOnboardingAnswers(answers);
    setStep("results");
  }, [answers]);

  function updateAnswers(partial: Partial<WelcomeOnboardingAnswers>) {
    setAnswers((current) => ({ ...current, ...partial }));
  }

  function canProceedForStep(current: WelcomeQuestionStep): boolean {
    switch (current) {
      case "artists":
        return (
          answers.artists.length >= WELCOME_ARTIST_MIN &&
          answers.artists.length <= WELCOME_ARTIST_MAX
        );
      case "parts":
        return effectiveParts(answers.parts).length >= (WELCOME_QUESTIONS.parts.minSelected ?? 1);
      case "sounds":
        return answers.sounds.length >= (WELCOME_QUESTIONS.sounds.minSelected ?? 1);
      case "color":
        return Boolean(answers.frequencyColor);
    }
  }

  return (
    <WelcomeShell members={members}>
      <AnimatePresence mode="wait">
        {step === "intro" ? (
          <WelcomeMotion stepKey="intro">
            <WelcomeIntroStep
              initialUser={initialUser}
              onStart={() => setStep("artists")}
            />
          </WelcomeMotion>
        ) : null}

        {step === "artists" || step === "parts" || step === "sounds" ? (
          <WelcomeMotion stepKey={step}>
            <WelcomeQuestionStepView
              step={step}
              config={WELCOME_QUESTIONS[step]}
              selected={
                step === "artists"
                  ? answers.artists
                  : step === "parts"
                    ? answers.parts
                    : answers.sounds
              }
              onChange={(next) => {
                if (step === "artists") {
                  updateAnswers({ artists: next });
                  return;
                }

                if (step === "parts") {
                  updateAnswers({ parts: next });
                  return;
                }

                updateAnswers({ sounds: next });
              }}
              onBack={() => setStep(getPreviousStep(step))}
              onNext={() => {
                if (!canProceedForStep(step)) {
                  return;
                }

                setStep(getNextQuestionStep(step));
              }}
              canProceed={canProceedForStep(step)}
            />
          </WelcomeMotion>
        ) : null}

        {step === "color" ? (
          <WelcomeMotion stepKey="color">
            <WelcomeColorStepView
              selected={answers.frequencyColor}
              onChange={(frequencyColor) => updateAnswers({ frequencyColor })}
              onBack={() => setStep(getPreviousStep(step))}
              onNext={() => {
                if (!canProceedForStep("color")) {
                  return;
                }

                setStep("analysis");
              }}
              canProceed={canProceedForStep("color")}
            />
          </WelcomeMotion>
        ) : null}

        {step === "analysis" ? (
          <WelcomeMotion stepKey="analysis">
            <WelcomeAnalysisStep onComplete={handleAnalysisComplete} />
          </WelcomeMotion>
        ) : null}

        {step === "results" ? (
          <WelcomeMotion stepKey="results">
            <WelcomeResultsStep
              matchedMembers={matchedMembers}
              musicDna={musicDna}
              renderStars={renderStars}
            />
          </WelcomeMotion>
        ) : null}
      </AnimatePresence>
    </WelcomeShell>
  );
}
