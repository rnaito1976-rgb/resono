export const POST_SIGNUP_HOME_PATH = "/";

/** @deprecated Legacy path — redirects to home. */
export const WELCOME_ONBOARDING_PATH = "/onboarding";

/** Post-signup destination (intro onboarding shows on home). */
export const WELCOME_ONBOARDING_HREF = POST_SIGNUP_HOME_PATH;

export function buildWelcomeOnboardingHref(): string {
  return POST_SIGNUP_HOME_PATH;
}

export function buildPostSignupHref(): string {
  return POST_SIGNUP_HOME_PATH;
}

export function isWelcomeOnboardingPath(path: string | null | undefined): boolean {
  if (!path) {
    return false;
  }

  return path.startsWith(WELCOME_ONBOARDING_PATH);
}
