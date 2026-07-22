"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.refresh();
      router.push("/welcome");
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
