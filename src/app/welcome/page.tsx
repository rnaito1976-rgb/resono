import { AuthFadeIn } from "@/components/auth/AuthMotion";
import { AuthLogo, AuthShell, AuthTagline } from "@/components/auth/AuthShell";
import { AuthWelcomeActions } from "@/components/auth/AuthWelcomeActions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

          <AuthWelcomeActions initialUser={user} />
        </AuthFadeIn>
      </div>
    </AuthShell>
  );
}
