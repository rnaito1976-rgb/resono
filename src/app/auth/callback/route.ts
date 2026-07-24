import { NextResponse, type NextRequest } from "next/server";
import { getAuthApiErrorMessage } from "@/lib/auth/errors";
import {
  getAuthOrigin,
  sanitizeNextPath,
} from "@/lib/auth/urls";
import { ensureMemberForUser } from "@/lib/members";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const origin = getAuthOrigin(request);
  const authError =
    requestUrl.searchParams.get("error_description") ??
    requestUrl.searchParams.get("error");

  if (!code) {
    const reason = authError
      ? encodeURIComponent(authError)
      : "missing_code";
    return NextResponse.redirect(`${origin}/login?error=auth&reason=${reason}`);
  }

  const { supabase, applyCookies } = createRouteHandlerClient(request);
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureMemberForUser(user.id, user.email);
  }

  return applyCookies(NextResponse.redirect(`${origin}${next}`));
}
