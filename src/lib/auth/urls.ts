import type { NextRequest } from "next/server";
import { getSiteUrl } from "@/lib/supabase/env";

export function sanitizeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next.split("?")[0] || "/";
}

export function getRequestOrigin(request: NextRequest, fallbackOrigin: string): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return fallbackOrigin;
}

/** OAuth callback must stay on the same host that stored the PKCE cookie. */
export function getAuthOrigin(request: NextRequest): string {
  return getRequestOrigin(request, getSiteUrl());
}

/** Bare callback URL so Supabase redirect allowlists match exactly. */
export function getAuthCallbackUrl(request: NextRequest): string {
  return `${getAuthOrigin(request).replace(/\/$/, "")}/auth/callback`;
}
