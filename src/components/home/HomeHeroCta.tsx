import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HomeHeroCtaProps = {
  isLoggedIn: boolean;
};

export function HomeHeroCta({ isLoggedIn }: HomeHeroCtaProps) {
  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="space-y-2.5 pt-1">
      <Link
        href="/welcome"
        className={cn(buttonVariants({ size: "lg" }), "h-12 w-full rounded-full text-[15px]")}
      >
        好きなアーティストを選んで始める
      </Link>
      <p className="text-center text-[13px] leading-relaxed text-white/40">
        無料 · 好きな音楽からプロフィールが作れます
      </p>
    </div>
  );
}
