"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/useAuthUser";
import { buildLoginHref } from "@/lib/navigation/login-redirect";
import { setMenuReturnPath } from "@/lib/navigation/menu-return";

type AuthHeaderActionsProps = {
  initialUser?: User | null;
};

export function AuthHeaderActions({ initialUser = null }: AuthHeaderActionsProps) {
  const { isLoggedIn, isLoading } = useAuthUser(initialUser);
  const pathname = usePathname();
  const router = useRouter();

  if (isLoading) {
    return <div className="h-9 w-10" aria-hidden />;
  }

  const menuHref = isLoggedIn ? "/menu" : buildLoginHref(pathname);

  return (
    <>
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="h-10 w-10 text-white/70 hover:bg-white/[0.06] hover:text-white"
      >
        <Link
          href={menuHref}
          prefetch={isLoggedIn}
          aria-label="Menu"
          onMouseEnter={isLoggedIn ? () => router.prefetch("/menu") : undefined}
          onFocus={isLoggedIn ? () => router.prefetch("/menu") : undefined}
          onClick={isLoggedIn ? () => setMenuReturnPath(pathname) : undefined}
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </Link>
      </Button>
      {!isLoggedIn ? (
        <>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-[13px] text-white/60 hover:text-white"
          >
            <Link href={buildLoginHref(pathname)}>ログイン</Link>
          </Button>
          <Button asChild size="sm" className="h-9 px-4 text-[13px]">
            <Link href="/welcome">新規登録</Link>
          </Button>
        </>
      ) : null}
    </>
  );
}
