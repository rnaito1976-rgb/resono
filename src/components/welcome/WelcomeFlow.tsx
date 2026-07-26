"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { WelcomeAnalysisStep } from "@/components/welcome/WelcomeAnalysisStep";
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

const INITIAL_ANSWERS: WelcomeOnboardingAnswers = {
  artists: [],
  coverSongs: [],
  parts: [],
  bandStyle: "",
};

type WelcomeFlowProps = {
  initialUser?: User | null;
  members: Member[];
};

function getPreviousStep(step: WelcomeStep): WelcomeStep {
  switch (step) {
    case "artists":
      return "intro";
    case "covers":
      return "artists";
    case "parts":
      return "covers";
    case "band-style":
      return "parts";
    default:
      return "intro";
  }
}

function getNextQuestionStep(step: WelcomeQuestionStep): WelcomeStep {
  switch (step) {
    case "artists":
      return "covers";
    case "covers":
      return "parts";
    case "parts":
      return "band-style";
    case "band-style":
      return "analysis";
  }
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
        return answers.artists.length > 0;
      case "covers":
        return answers.coverSongs.length > 0;
      case "parts":
        return answers.parts.length > 0;
      case "band-style":
        return answers.bandStyle.length > 0;
    }
  }

  return (
    <WelcomeShell>
      <AnimatePresence mode="wait">
        {step === "intro" ? (
          <WelcomeMotion stepKey="intro">
            <WelcomeIntroStep
              initialUser={initialUser}
              onStart={() => setStep("artists")}
            />
          </WelcomeMotion>
        ) : null}

        {step === "artists" || step === "covers" || step === "parts" || step === "band-style" ? (
          <WelcomeMotion stepKey={step}>
            <WelcomeQuestionStepView
              step={step}
              config={WELCOME_QUESTIONS[step]}
              selected={
                step === "artists"
                  ? answers.artists
                  : step === "covers"
                    ? answers.coverSongs
                    : step === "parts"
                      ? answers.parts
                      : answers.bandStyle
                        ? [answers.bandStyle]
                        : []
              }
              onChange={(next) => {
                if (step === "artists") {
                  updateAnswers({ artists: next });
                  return;
                }

                if (step === "covers") {
                  updateAnswers({ coverSongs: next });
                  return;
                }

                if (step === "parts") {
                  updateAnswers({ parts: next });
                  return;
                }

                updateAnswers({ bandStyle: next[0] ?? "" });
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
