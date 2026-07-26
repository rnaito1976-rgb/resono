"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/useAuthUser";
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

  if (isLoggedIn) {
    return (
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="h-10 w-10 text-white/70 hover:bg-white/[0.06] hover:text-white"
      >
        <Link
          href="/menu"
          prefetch
          aria-label="Menu"
          onMouseEnter={() => router.prefetch("/menu")}
          onFocus={() => router.prefetch("/menu")}
          onClick={() => setMenuReturnPath(pathname)}
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </Link>
      </Button>
    );
  }

  return (
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
        <Link href="/welcome">新規登録</Link>
      </Button>
    </>
  );
}
