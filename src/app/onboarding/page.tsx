import Link from "next/link";
import { AuthFadeIn } from "@/components/auth/AuthMotion";
import { AuthLogo, AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  return (
    <AuthShell variant="welcome">
      <div className="flex flex-1 flex-col">
        <AuthFadeIn>
          <AuthLogo />
          <h1 className="mt-12 text-[30px] font-light leading-tight tracking-tight text-white">
            ようこそ、
            <br />
            Resono へ
          </h1>
          <p className="mt-4 max-w-[300px] text-[15px] leading-[1.8] text-white/55">
            あなたの世界観をプロフィールに映し、
            共鳴するミュージシャンと出会いましょう。
          </p>
        </AuthFadeIn>

        <div className="flex-1" />

        <AuthFadeIn className="space-y-10">
          <div className="space-y-6 border-l border-white/10 pl-5">
            <OnboardingStep
              step="01"
              title="プロフィールを整える"
              description="音楽・ファッション・ムードを表現"
            />
            <OnboardingStep
              step="02"
              title="共鳴する人を見つける"
              description="世界観が重なるミュージシャンと出会う"
            />
            <OnboardingStep
              step="03"
              title="バンドを始める"
              description="Looking For からメンバーを募集"
            />
          </div>

          <Button asChild size="lg" className="w-full">
            <Link href="/">はじめる</Link>
          </Button>
        </AuthFadeIn>
      </div>
    </AuthShell>
  );
}

function OnboardingStep({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
        {step}
      </p>
      <p className="mt-1 text-[16px] text-white">{title}</p>
      <p className="mt-1 text-[13px] text-white/45">{description}</p>
    </div>
  );
}
