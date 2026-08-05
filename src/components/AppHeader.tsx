import type { User } from "@supabase/supabase-js";
import { AuthHeaderActions } from "@/components/auth/AuthHeaderActions";
import { HomeLogoLink } from "@/components/navigation/HomeLogoLink";
import { BRAND_CATCH_COPY_INLINE } from "@/lib/branding/copy";
import { HOME_H1, HOME_LEAD } from "@/lib/seo/site";

type AppHeaderProps = {
  initialUser?: User | null;
};

export function AppHeader({ initialUser = null }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/85 px-5 pb-5 pt-10 backdrop-blur-xl">
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

      <h1 className="mt-5 text-[22px] font-light leading-snug tracking-tight text-white/90">
        {HOME_H1}
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-white/55">{HOME_LEAD}</p>
      <p className="mt-2 text-[14px] leading-relaxed text-white/40">
        {BRAND_CATCH_COPY_INLINE}
      </p>
    </header>
  );
}
