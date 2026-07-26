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

export function getAuthOrigin(request: NextRequest): string {
  const requestOrigin = new URL(request.url).origin;

  if (process.env.NODE_ENV === "development") {
    return requestOrigin;
  }

  return getSiteUrl() || requestOrigin;
}

type AuthCallbackOptions = {
  origin?: string;
};

/** Bare callback URL so Supabase redirect allowlists match exactly. */
export function getAuthCallbackUrl(options: AuthCallbackOptions = {}): string {
  const base = (options.origin ?? getSiteUrl()).replace(/\/$/, "");
  return `${base}/auth/callback`;
}
