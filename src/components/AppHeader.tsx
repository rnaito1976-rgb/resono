import type { User } from "@supabase/supabase-js";
import { AuthHeaderActions } from "@/components/auth/AuthHeaderActions";
import { HomeLogoLink } from "@/components/navigation/HomeLogoLink";
import { BRAND_CATCH_COPY_INLINE } from "@/lib/branding/copy";

type AppHeaderProps = {
  initialUser?: User | null;
};

export function AppHeader({ initialUser = null }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/85 px-5 pb-5 pt-10 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <HomeLogoLink className="flex items-center">
          <h1 className="text-xl font-medium leading-none tracking-[0.35em] text-white">
            RESONO
          </h1>
        </HomeLogoLink>

        <div className="flex shrink-0 items-center gap-1">
          <AuthHeaderActions initialUser={initialUser} />
        </div>
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-white/45">
        {BRAND_CATCH_COPY_INLINE}
      </p>
    </header>
  );
}
