"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { AuthLogo } from "@/components/auth/AuthShell";
import { WelcomeFade } from "@/components/welcome/WelcomeMotion";
import { Button } from "@/components/ui/button";
import { BRAND_CATCH_COPY, BRAND_DESCRIPTION } from "@/lib/branding/copy";

type WelcomeIntroStepProps = {
  initialUser?: User | null;
  onStart: () => void;
};

export function WelcomeIntroStep({ initialUser, onStart }: WelcomeIntroStepProps) {
  return (
    <div className="flex min-h-dvh flex-col px-5 pb-10 pt-10">
      <WelcomeFade className="flex flex-1 flex-col">
        <AuthLogo />
        <p className="mt-6 max-w-[320px] whitespace-pre-line text-[22px] font-light leading-[1.65] tracking-tight">
          {BRAND_CATCH_COPY}
        </p>
        <p className="mt-5 max-w-[320px] whitespace-pre-line text-[15px] leading-[1.85] text-white/45">
          {BRAND_DESCRIPTION}
        </p>
      </WelcomeFade>

      <WelcomeFade className="space-y-4">
        {initialUser ? (
          <Button asChild size="lg" className="h-12 w-full rounded-full text-[15px]">
            <Link href="/">ホームへ</Link>
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            className="h-12 w-full rounded-full text-[15px]"
            onClick={onStart}
          >
            はじめる
          </Button>
        )}
      </WelcomeFade>
    </div>
  );
}
