"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useTransition } from "react";
import {
  consumeMenuReturnPath,
  peekMenuReturnPath,
} from "@/lib/navigation/menu-return";

export function MenuCloseLink() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const returnTo = peekMenuReturnPath();
    router.prefetch(returnTo);
    router.prefetch("/");
  }, [router]);

  const handleClose = useCallback(() => {
    startTransition(() => {
      const returnTo = consumeMenuReturnPath();
      router.push(returnTo);
    });
  }, [router]);

  return (
    <button
      type="button"
      onClick={handleClose}
      disabled={isPending}
      className="shrink-0 pt-1 text-[17px] font-normal text-primary transition-quiet active:opacity-70 disabled:opacity-60"
    >
      Close
    </button>
  );
}
