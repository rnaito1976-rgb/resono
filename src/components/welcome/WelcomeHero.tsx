"use client";

import type { User } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { AuthFadeIn } from "@/components/auth/AuthMotion";
import { AuthLogo } from "@/components/auth/AuthShell";
import { AuthWelcomeActions } from "@/components/auth/AuthWelcomeActions";
import { BRAND_CATCH_COPY, BRAND_DESCRIPTION } from "@/lib/branding/copy";

const BG = "#0A0A0A";
const TEXT = "#F6F6F6";

type WelcomeHeroProps = {
  initialUser?: User | null;
  backdrop?: ReactNode;
};

export function WelcomeHero({
  initialUser = null,
  backdrop = null,
}: WelcomeHeroProps) {
  return (
    <div
      className="relative mx-auto min-h-dvh w-full max-w-mobile overflow-hidden"
      style={{ backgroundColor: BG, color: TEXT }}
    >
      {backdrop}

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
            <p className="mx-auto mt-6 max-w-[320px] text-[22px] font-light leading-[1.65] tracking-tight text-[#F6F6F6]">
              {BRAND_CATCH_COPY}
            </p>
            <p className="mx-auto mt-5 max-w-[320px] text-[15px] leading-[1.85] text-[#F6F6F6]/55">
              {BRAND_DESCRIPTION}
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
