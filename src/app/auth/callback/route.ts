import { NextResponse, type NextRequest } from "next/server";
import { ensureMemberForUser } from "@/lib/members";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

function sanitizeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

function getRedirectOrigin(request: NextRequest, fallbackOrigin: string): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return fallbackOrigin;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const origin = getRedirectOrigin(request, requestUrl.origin);
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
    console.error("[Auth callback] exchangeCodeForSession:", error.message);
    return applyCookies(
      NextResponse.redirect(
        `${origin}/login?error=auth&reason=${encodeURIComponent(error.message)}`
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
