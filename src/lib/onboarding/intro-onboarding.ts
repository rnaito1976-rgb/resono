import type { Member } from "@/types/member";

export type IntroOnboardingStep = {
  id: string;
  /** 本文段落（改行は \n） */
  paragraphs: string[];
  ctaLabel: string;
};

export const INTRO_ONBOARDING_STEPS: IntroOnboardingStep[] = [
  {
    id: "welcome",
    paragraphs: [
      "音楽の共鳴から、バンドが生まれる。",
      "互いに共鳴した相手とは、\nメッセージ機能で交流したり、\nバンド機能で新しいバンドを結成できます。",
    ],
    ctaLabel: "はじめる",
  },
];

export function shouldShowIntroOnboarding(
  portrait: Pick<
    Member["portrait"],
    "introOnboardingPending" | "introOnboardingCompleted"
  >
): boolean {
  return (
    portrait.introOnboardingPending === true &&
    portrait.introOnboardingCompleted !== true
  );
}

export const INTRO_ONBOARDING_PREVIEW_PARAM = "previewIntroOnboarding";

export function isIntroOnboardingPreviewEnabled(
  value: string | null | undefined
): boolean {
  return value === "1";
}

const LOCAL_STORAGE_PREFIX = "resono:intro-onboarding:dismissed:";
const SESSION_PENDING_KEY = "resono:intro-onboarding:pending";
export const INTRO_ONBOARDING_PENDING_EVENT = "resono:intro-onboarding-pending";

export function readIntroOnboardingSessionPending(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return sessionStorage.getItem(SESSION_PENDING_KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroOnboardingSessionPending(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(SESSION_PENDING_KEY, "1");
    window.dispatchEvent(new Event(INTRO_ONBOARDING_PENDING_EVENT));
  } catch {
    // ignore quota / private mode
  }
}

export function clearIntroOnboardingSessionPending(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.removeItem(SESSION_PENDING_KEY);
  } catch {
    // ignore
  }
}

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
