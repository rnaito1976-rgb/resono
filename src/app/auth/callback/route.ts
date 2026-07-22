import { NextResponse } from "next/server";
import { ensureMemberForUser } from "@/lib/members";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createRouteHandlerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await ensureMemberForUser(user.id, user.email);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("[Auth callback] exchangeCodeForSession:", error.message);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
