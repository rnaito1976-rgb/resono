"use client";

import type { User } from "@supabase/supabase-js";
import { AuthFadeIn } from "@/components/auth/AuthMotion";
import { AuthLogo, AuthTagline } from "@/components/auth/AuthShell";
import { AuthWelcomeActions } from "@/components/auth/AuthWelcomeActions";
import { WelcomeProfileBackdrop } from "@/components/welcome/WelcomeProfileBackdrop";
import type { Member } from "@/types/member";

const BG = "#0A0A0A";
const TEXT = "#F6F6F6";

type WelcomeHeroProps = {
  initialUser?: User | null;
  members?: Member[];
};

export function WelcomeHero({
  initialUser = null,
  members = [],
}: WelcomeHeroProps) {
  return (
    <div
      className="relative mx-auto min-h-dvh w-full max-w-mobile overflow-hidden"
      style={{ backgroundColor: BG, color: TEXT }}
    >
      <WelcomeProfileBackdrop members={members} visible />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-black/75 via-black/55 to-black/90"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(circle_at_50%_32%,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.78)_72%)]"
      />

      <div className="relative z-10 flex min-h-dvh flex-col px-6 pb-10 pt-14">
        <div className="flex flex-1 flex-col items-center justify-center pb-10 pt-6 text-center">
          <AuthFadeIn className="text-center">
            <AuthLogo className="text-center text-[#F6F6F6]" />
            <AuthTagline className="text-[#F6F6F6]/70" />
            <p className="mx-auto mt-6 max-w-[300px] text-[17px] leading-[1.85] text-[#F6F6F6]/55">
              世界観で共鳴する
              <br />
              ミュージシャンと出会う。
            </p>
          </AuthFadeIn>
        </div>

        <AuthFadeIn>
          <AuthWelcomeActions initialUser={initialUser} />
        </AuthFadeIn>
      </div>
    </div>
  );
}
