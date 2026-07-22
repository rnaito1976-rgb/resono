import Link from "next/link";
import { AuthHeaderActions } from "@/components/auth/AuthHeaderActions";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 bg-background/80 px-6 pb-4 pt-8 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/">
            <h1 className="text-xl font-medium tracking-[0.35em] text-white">RESONO</h1>
          </Link>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            世界観で共鳴するバンドメンバーと出会う
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <AuthHeaderActions />
        </div>
      </div>
    </header>
  );
}
