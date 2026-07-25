import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

/** Session refresh only on authenticated app routes — skip home/welcome/auth for speed. */
export const config = {
  matcher: [
    "/me/:path*",
    "/member/:path*",
    "/messages/:path*",
    "/bands/:path*",
    "/discover/:path*",
    "/onboarding/:path*",
  ],
};
