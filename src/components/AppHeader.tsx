import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { AuthHeaderActions } from "@/components/auth/AuthHeaderActions";

type AppHeaderProps = {
  initialUser?: User | null;
};

export function AppHeader({ initialUser = null }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/85 px-5 pb-5 pt-10 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/">
            <h1 className="text-xl font-medium tracking-[0.35em] text-white">RESONO</h1>
          </Link>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            世界観で共鳴する仲間と出会う
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <AuthHeaderActions initialUser={initialUser} />
        </div>
      </div>
    </header>
  );
}
