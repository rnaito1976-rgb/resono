import type { NextRequest } from "next/server";
import { getSiteUrl } from "@/lib/supabase/env";

export function sanitizeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

export function getRequestOrigin(request: NextRequest, fallbackOrigin: string): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return fallbackOrigin;
}

export function getAuthOrigin(request: NextRequest): string {
  return getSiteUrl() || getRequestOrigin(request, new URL(request.url).origin);
}

export function getAuthCallbackUrl(nextPath = "/"): string {
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(sanitizeNextPath(nextPath))}`;
}
