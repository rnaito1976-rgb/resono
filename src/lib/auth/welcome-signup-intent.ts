import type { NextRequest, NextResponse } from "next/server";
import { sanitizeNextPath } from "@/lib/auth/urls";
import { POST_SIGNUP_HOME_PATH } from "@/lib/navigation/onboarding";

export const WELCOME_SIGNUP_INTENT_COOKIE = "resono-welcome-signup";
export const AUTH_NEXT_PATH_COOKIE = "resono-auth-next";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 10,
};

export function setWelcomeSignupIntent(response: NextResponse) {
  response.cookies.set(WELCOME_SIGNUP_INTENT_COOKIE, "1", cookieOptions);
}

export function readWelcomeSignupIntent(request: NextRequest): boolean {
  return request.cookies.get(WELCOME_SIGNUP_INTENT_COOKIE)?.value === "1";
}

export function setAuthNextPath(response: NextResponse, nextPath: string) {
  response.cookies.set(AUTH_NEXT_PATH_COOKIE, sanitizeNextPath(nextPath), cookieOptions);
}

export function readAuthNextPath(request: NextRequest): string | null {
  const value = request.cookies.get(AUTH_NEXT_PATH_COOKIE)?.value;
  return value ? sanitizeNextPath(value) : null;
}

export function clearAuthFlowCookies(response: NextResponse) {
  response.cookies.delete(WELCOME_SIGNUP_INTENT_COOKIE);
  response.cookies.delete(AUTH_NEXT_PATH_COOKIE);
}

export function resolveWelcomeSignupDestination(
  request: NextRequest,
  fallback: string
): string {
  if (readWelcomeSignupIntent(request)) {
    return POST_SIGNUP_HOME_PATH;
  }

  return fallback;
}

export function resolveAuthNextPath(request: NextRequest, fallback = "/"): string {
  return readAuthNextPath(request) ?? fallback;
}
