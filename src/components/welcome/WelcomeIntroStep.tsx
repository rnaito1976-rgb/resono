"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { AuthLogo } from "@/components/auth/AuthShell";
import { WelcomeFade } from "@/components/welcome/WelcomeMotion";
import { WelcomeStartResonoButton } from "@/components/welcome/WelcomeStartResonoButton";
import { Button } from "@/components/ui/button";
import { BRAND_CATCH_COPY, BRAND_HERO_LINE, BRAND_WELCOME_LEAD } from "@/lib/branding/copy";

type WelcomeIntroStepProps = {
  initialUser?: User | null;
  onStart: () => void;
};

export function WelcomeIntroStep({ initialUser, onStart }: WelcomeIntroStepProps) {
  return (
    <div className="flex min-h-dvh flex-col px-5 pb-10 pt-10">
      <WelcomeFade className="flex flex-1 flex-col items-center justify-center text-center">
        <AuthLogo className="text-white" />
        <p className="mx-auto mt-6 max-w-[320px] whitespace-pre-line text-[22px] font-light leading-[1.65] tracking-tight">
          {BRAND_HERO_LINE}
        </p>
        <p className="mx-auto mt-5 max-w-[320px] whitespace-pre-line text-[15px] leading-[1.85] text-white/45">
          {BRAND_WELCOME_LEAD}
        </p>
        <p className="mx-auto mt-4 max-w-[320px] text-[14px] leading-relaxed text-white/35">
          {BRAND_CATCH_COPY.replace("\n", " ")}
        </p>
      </WelcomeFade>

      <WelcomeFade className="w-full space-y-4">
        {initialUser ? (
          <WelcomeStartResonoButton />
        ) : (
          <>
            <Button
              type="button"
              size="lg"
              className="h-12 w-full rounded-full text-[15px]"
              onClick={onStart}
            >
              はじめる
            </Button>

            <p className="text-center text-[14px] text-white/45">
              すでにアカウントをお持ちの方は{" "}
              <Link
                href="/login?from=welcome"
                className="font-medium text-primary transition-quiet active:opacity-70"
              >
                ログイン
              </Link>
            </p>
          </>
        )}
      </WelcomeFade>
    </div>
  );
}
