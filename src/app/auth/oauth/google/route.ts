import { NextResponse, type NextRequest } from "next/server";
import { getAuthApiErrorMessage } from "@/lib/auth/errors";
import {
  getAuthCallbackUrl,
  getAuthOrigin,
  sanitizeNextPath,
} from "@/lib/auth/urls";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const origin = getAuthOrigin(request);
  const { supabase, applyCookies } = createRouteHandlerClient(request);

  const redirectTo = getAuthCallbackUrl(next);

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

  return applyCookies(NextResponse.redirect(data.url));
}
