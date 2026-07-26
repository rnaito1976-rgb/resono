import type { WelcomeOnboardingAnswers } from "@/types/welcome-onboarding";
import { WELCOME_ARTIST_MIN } from "@/types/welcome-onboarding";
import { readWelcomeOnboardingAnswers } from "@/lib/welcome/onboarding-storage";

export function effectiveWelcomeParts(parts: string[]): string[] {
  return parts.filter((part) => part !== "Other");
}

export function readValidWelcomeOnboardingAnswers(): WelcomeOnboardingAnswers | null {
  const answers = readWelcomeOnboardingAnswers();
  if (!answers) {
    return null;
  }

  if (answers.artists.length < WELCOME_ARTIST_MIN) {
    return null;
  }

  if (effectiveWelcomeParts(answers.parts).length < 1) {
    return null;
  }

  return answers;
}
