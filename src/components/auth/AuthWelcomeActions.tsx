"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/useAuthUser";

type AuthWelcomeActionsProps = {
  initialUser?: User | null;
};

export function AuthWelcomeActions({ initialUser = null }: AuthWelcomeActionsProps) {
  const { isLoggedIn, isLoading } = useAuthUser(initialUser);

  if (isLoading) {
    return <div className="h-14" aria-hidden />;
  }

  if (isLoggedIn) {
    return (
      <div className="space-y-4">
        <Button asChild size="lg" className="w-full">
          <Link href="/">ホームへ</Link>
        </Button>
        <div className="flex justify-center">
          <LogoutButton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button asChild size="lg" className="w-full">
        <Link href="/signup">新規登録</Link>
      </Button>
      <div className="text-center">
        <Link
          href="/login"
          className="text-[15px] font-medium text-white/60 transition-colors hover:text-white"
        >
          ログイン
        </Link>
      </div>
    </div>
  );
}
