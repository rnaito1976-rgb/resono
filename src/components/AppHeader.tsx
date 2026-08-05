import type { User } from "@supabase/supabase-js";
import { AuthHeaderActions } from "@/components/auth/AuthHeaderActions";
import { HomeLogoLink } from "@/components/navigation/HomeLogoLink";

type AppHeaderProps = {
  initialUser?: User | null;
};

export function AppHeader({ initialUser = null }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/85 px-5 pb-4 pt-10 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <HomeLogoLink className="flex items-center">
          <p className="text-xl font-medium leading-none tracking-[0.35em] text-white">
            RESONO
          </p>
        </HomeLogoLink>

        <div className="flex shrink-0 items-center gap-1">
          <AuthHeaderActions initialUser={initialUser} />
        </div>
      </div>
    </header>
  );
}
