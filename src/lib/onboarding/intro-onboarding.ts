export const INTRO_ONBOARDING_MESSAGE =
  "互いに共鳴するとメッセージ・バンド機能が使えるようになります。";

export const INTRO_ONBOARDING_CTA = "共鳴する仲間を探そう";

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
