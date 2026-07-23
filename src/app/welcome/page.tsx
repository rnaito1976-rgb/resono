import { AuthFadeIn } from "@/components/auth/AuthMotion";
import { AuthLogo, AuthTagline } from "@/components/auth/AuthShell";
import { AuthWelcomeActions } from "@/components/auth/AuthWelcomeActions";
import { WelcomeProfileBackdrop } from "@/components/welcome/WelcomeProfileBackdrop";
import { getMembers } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const [members, supabase] = await Promise.all([getMembers(), createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-mobile overflow-hidden bg-black">
      <WelcomeProfileBackdrop members={members} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/75 via-black/55 to-black/90"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_32%,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.78)_72%)]"
      />

      <div className="relative z-20 flex min-h-dvh flex-col px-6 pb-10 pt-14">
        <div className="flex flex-1 flex-col justify-center pb-10 pt-6">
          <AuthFadeIn className="text-center">
            <AuthLogo className="text-center" />
            <AuthTagline />
            <p className="mx-auto mt-8 max-w-[300px] text-center text-[17px] leading-[1.85] text-white/55">
              世界観でつながる
              <br />
              ミュージシャンのための場所
            </p>
          </AuthFadeIn>
        </div>

        <AuthFadeIn>
          <AuthWelcomeActions initialUser={user} />
        </AuthFadeIn>
      </div>
    </div>
  );
}
