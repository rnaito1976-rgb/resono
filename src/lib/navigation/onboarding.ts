export const WELCOME_ONBOARDING_PATH = "/onboarding";
export const WELCOME_ONBOARDING_HREF = "/onboarding?skipPhoto=1";

export function buildWelcomeOnboardingHref(): string {
  return WELCOME_ONBOARDING_HREF;
}

export function isWelcomeOnboardingPath(path: string | null | undefined): boolean {
  if (!path) {
    return false;
  }

  return (
    path.startsWith(WELCOME_ONBOARDING_PATH) &&
    (path.includes("skipPhoto=1") || path === WELCOME_ONBOARDING_PATH)
  );
}
