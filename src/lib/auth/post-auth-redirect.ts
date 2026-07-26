import { sanitizeNextPath } from "@/lib/auth/urls";
import {
  WELCOME_ONBOARDING_HREF,
  WELCOME_ONBOARDING_PATH,
} from "@/lib/navigation/onboarding";

/** Route first-time users to onboarding instead of the home feed. */
export function resolvePostAuthRedirect(
  next: string | null | undefined,
  onboardingComplete: boolean,
  skipPhoto = false
): string {
  const pathOnly = sanitizeNextPath(next);

  if (skipPhoto || pathOnly === WELCOME_ONBOARDING_PATH) {
    return WELCOME_ONBOARDING_HREF;
  }

  if (!onboardingComplete) {
    return WELCOME_ONBOARDING_HREF;
  }

  return pathOnly;
}
