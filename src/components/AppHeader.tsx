import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  user: { id: string } | null;
};

export function AppHeader({ user }: AppHeaderProps) {
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
          {user ? (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-[13px] text-white/60 hover:text-white"
              >
                <Link href="/me">マイページ</Link>
              </Button>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-[13px] text-white/60 hover:text-white"
              >
                <Link href="/login">ログイン</Link>
              </Button>
              <Button asChild size="sm" className="h-9 px-4 text-[13px]">
                <Link href="/signup">新規登録</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
