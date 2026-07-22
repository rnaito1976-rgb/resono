"use client";

import { useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/welcome";
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("h-9 px-3 text-[13px] text-white/60 hover:text-white", className)}
      disabled={isPending}
      onClick={handleSignOut}
    >
      {isPending ? "処理中..." : "ログアウト"}
    </Button>
  );
}
