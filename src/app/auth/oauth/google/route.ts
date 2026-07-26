import { NextResponse, type NextRequest } from "next/server";
import { getAuthApiErrorMessage } from "@/lib/auth/errors";
import {
  setAuthNextPath,
  setWelcomeSignupIntent,
} from "@/lib/auth/welcome-signup-intent";
import {
  getAuthOrigin,
  getAuthCallbackUrl,
  sanitizeNextPath,
} from "@/lib/auth/urls";
import { WELCOME_ONBOARDING_PATH } from "@/lib/navigation/onboarding";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const skipPhoto = requestUrl.searchParams.get("skipPhoto") === "1";
  const origin = getAuthOrigin(request);
  const { supabase, applyCookies } = createRouteHandlerClient(request);

  const redirectTo = getAuthCallbackUrl({ origin });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    const message = error
      ? getAuthApiErrorMessage(error)
      : "Google ログインを開始できませんでした。";
    console.error("[Auth oauth/google]", message, error);
    return applyCookies(
      NextResponse.redirect(
        `${origin}/login?error=auth&reason=${encodeURIComponent(message)}`
      )
    );
  }

  const response = NextResponse.redirect(data.url);
  if (skipPhoto || next === WELCOME_ONBOARDING_PATH) {
    setWelcomeSignupIntent(response);
  } else if (next !== "/") {
    setAuthNextPath(response, next);
  }

  return applyCookies(response);
}
