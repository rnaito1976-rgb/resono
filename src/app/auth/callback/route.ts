import { NextResponse, type NextRequest } from "next/server";
import { getAuthApiErrorMessage } from "@/lib/auth/errors";
import { toEmailOtpType } from "@/lib/auth/send-email-hook";
import {
  clearAuthFlowCookies,
  resolveAuthNextPath,
  resolveWelcomeSignupDestination,
} from "@/lib/auth/welcome-signup-intent";
import {
  getAuthOrigin,
  sanitizeNextPath,
} from "@/lib/auth/urls";
import { resolvePostAuthRedirect } from "@/lib/auth/post-auth-redirect";
import { ensureMemberForUser } from "@/lib/members";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";

async function finalizeAuthRedirect(
  request: NextRequest,
  origin: string,
  next: string,
  skipPhoto: boolean,
  applyCookies: (response: NextResponse) => NextResponse,
  supabase: ReturnType<typeof createRouteHandlerClient>["supabase"]
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureMemberForUser(user.id, user.email);
    const destination = resolveWelcomeSignupDestination(
      request,
      resolvePostAuthRedirect(next, skipPhoto)
    );

    const response = NextResponse.redirect(`${origin}${destination}`);
    clearAuthFlowCookies(response);
    return applyCookies(response);
  }

  const fallback = resolveWelcomeSignupDestination(request, next);
  const response = NextResponse.redirect(`${origin}${fallback}`);
  clearAuthFlowCookies(response);
  return applyCookies(response);
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const otpType = toEmailOtpType(requestUrl.searchParams.get("type") ?? "");
  const queryNext = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const skipPhoto = requestUrl.searchParams.get("skipPhoto") === "1";
  const next = resolveAuthNextPath(request, queryNext);
  const origin = getAuthOrigin(request);
  const authError =
    requestUrl.searchParams.get("error_description") ??
    requestUrl.searchParams.get("error");

  const { supabase, applyCookies } = createRouteHandlerClient(request);

  if (tokenHash && otpType) {
    const { error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: tokenHash,
    });

    if (error) {
      const message = getAuthApiErrorMessage(error);
      console.error("[Auth callback] verifyOtp:", message, error);
      return applyCookies(
        NextResponse.redirect(
          `${origin}/login?error=auth&reason=${encodeURIComponent(message)}`
        )
      );
    }

    return finalizeAuthRedirect(request, origin, next, skipPhoto, applyCookies, supabase);
  }

  if (!code) {
    const reason = authError
      ? encodeURIComponent(authError)
      : "missing_code";
    return NextResponse.redirect(`${origin}/login?error=auth&reason=${reason}`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const message = getAuthApiErrorMessage(error);
    console.error("[Auth callback] exchangeCodeForSession:", message, error);
    return applyCookies(
      NextResponse.redirect(
        `${origin}/login?error=auth&reason=${encodeURIComponent(message)}`
      )
    );
  }

  return finalizeAuthRedirect(request, origin, next, skipPhoto, applyCookies, supabase);
}
