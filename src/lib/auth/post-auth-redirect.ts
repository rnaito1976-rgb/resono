import { sanitizeNextPath } from "@/lib/auth/urls";
import {
  WELCOME_ONBOARDING_HREF,
  WELCOME_ONBOARDING_PATH,
} from "@/lib/navigation/onboarding";

/** Honor explicit onboarding destinations; otherwise follow the requested next path. */
export function resolvePostAuthRedirect(
  next: string | null | undefined,
  skipPhoto = false
): string {
  const pathOnly = sanitizeNextPath(next);

  if (skipPhoto || pathOnly === WELCOME_ONBOARDING_PATH) {
    return WELCOME_ONBOARDING_HREF;
  }

  return pathOnly;
}
