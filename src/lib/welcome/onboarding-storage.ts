import type { WelcomeOnboardingAnswers } from "@/types/welcome-onboarding";

const STORAGE_KEY = "resono:welcome-onboarding";

export function saveWelcomeOnboardingAnswers(answers: WelcomeOnboardingAnswers) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
}

export function readWelcomeOnboardingAnswers(): WelcomeOnboardingAnswers | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as WelcomeOnboardingAnswers;
  } catch {
    return null;
  }
}

export function clearWelcomeOnboardingAnswers() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(STORAGE_KEY);
}
