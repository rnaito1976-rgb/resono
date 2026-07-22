import Link from "next/link";
import { AuthFadeIn } from "@/components/auth/AuthMotion";
import { AuthLogo, AuthShell, AuthTagline } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  return (
    <AuthShell variant="welcome">
      <div className="flex flex-1 flex-col">
        <AuthFadeIn>
          <AuthLogo />
          <AuthTagline />
        </AuthFadeIn>

        <div className="flex-1" />

        <AuthFadeIn className="space-y-10">
          <p className="max-w-[300px] text-[17px] leading-[1.85] text-white/55">
            世界観でつながる
            <br />
            ミュージシャンのための場所
          </p>

          <div className="space-y-4">
            <Button asChild size="lg" className="w-full">
              <Link href="/signup">新規登録</Link>
            </Button>
            <div className="text-center">
              <Link
                href="/login"
                className="text-[15px] font-medium text-white/60 transition-colors hover:text-white"
              >
                ログイン
              </Link>
            </div>
          </div>
        </AuthFadeIn>
      </div>
    </AuthShell>
  );
}
