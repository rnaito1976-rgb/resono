import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PRIMARY_HOST = "resono.band";

const LEGACY_HOSTS = new Set(["resono-fwdi.vercel.app"]);

function redirectToPrimaryHost(request: NextRequest): NextResponse | null {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();

  if (!host || !LEGACY_HOSTS.has(host)) {
    return null;
  }

  const destination = request.nextUrl.clone();
  destination.protocol = "https:";
  destination.host = PRIMARY_HOST;

  return NextResponse.redirect(destination, 308);
}

export async function middleware(request: NextRequest) {
  const legacyRedirect = redirectToPrimaryHost(request);
  if (legacyRedirect) {
    return legacyRedirect;
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|auth/oauth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
