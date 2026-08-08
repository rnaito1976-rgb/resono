export const INTRO_ONBOARDING_MESSAGE =
  "気になる人に共鳴を送ると、メッセージやBand機能が使えるようになります。";

const LOCAL_STORAGE_PREFIX = "resono:intro-onboarding:dismissed:";

export function readIntroOnboardingDismissedLocally(userId: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${userId}`) === "1";
  } catch {
    return false;
  }
}

export function writeIntroOnboardingDismissedLocally(userId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${userId}`, "1");
  } catch {
    // ignore quota / private mode
  }
}
