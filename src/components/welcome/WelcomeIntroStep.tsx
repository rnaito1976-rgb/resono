"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { WelcomeFade } from "@/components/welcome/WelcomeMotion";
import { WelcomeIllustration } from "@/components/welcome/WelcomeIllustration";
import { Button } from "@/components/ui/button";

type WelcomeIntroStepProps = {
  initialUser?: User | null;
  onStart: () => void;
};

export function WelcomeIntroStep({ initialUser, onStart }: WelcomeIntroStepProps) {
  return (
    <div className="flex min-h-dvh flex-col px-6 pb-10 pt-14">
      <WelcomeFade className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary">
          Resono
        </p>
        <h1 className="mt-5 max-w-[320px] text-[30px] font-light leading-[1.35] tracking-tight">
          共鳴する仲間と、バンドを始めよう。
        </h1>
        <p className="mt-5 max-w-[320px] text-[16px] leading-[1.8] text-muted">
          音楽も、ファッションも、価値観も。
          <br />
          共鳴でつながる、新しいバンドメンバー募集サービス。
        </p>

        <div className="my-10">
          <WelcomeIllustration />
        </div>
      </WelcomeFade>

      <WelcomeFade className="space-y-3">
        {initialUser ? (
          <Button asChild size="lg" className="h-14 w-full rounded-full text-[17px]">
            <Link href="/">ホームへ</Link>
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            className="h-14 w-full rounded-full text-[17px]"
            onClick={onStart}
          >
            はじめる
          </Button>
        )}

        {!initialUser ? (
          <p className="text-center text-[13px] text-muted">
            約30秒であなたに合う仲間を探します
          </p>
        ) : null}
      </WelcomeFade>
    </div>
  );
}
