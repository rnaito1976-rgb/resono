import { sanitizeNextPath } from "@/lib/auth/urls";
import { POST_SIGNUP_HOME_PATH } from "@/lib/navigation/onboarding";

/** Honor explicit next paths; welcome signup flows land on home. */
export function resolvePostAuthRedirect(
  next: string | null | undefined,
  skipPhoto = false
): string {
  void skipPhoto;
  const pathOnly = sanitizeNextPath(next);

  if (pathOnly === "/onboarding" || pathOnly.startsWith("/onboarding?")) {
    return POST_SIGNUP_HOME_PATH;
  }

  return pathOnly;
}
