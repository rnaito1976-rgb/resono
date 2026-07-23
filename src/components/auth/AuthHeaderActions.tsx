"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/useAuthUser";

type AuthHeaderActionsProps = {
  initialUser?: User | null;
};

export function AuthHeaderActions({ initialUser = null }: AuthHeaderActionsProps) {
  const { isLoggedIn, isLoading } = useAuthUser(initialUser);

  if (isLoading) {
    return <div className="h-9 w-20" aria-hidden />;
  }

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-1">
        <LogoutButton />
      </div>
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
        <Link href="/signup">新規登録</Link>
      </Button>
    </>
  );
}
