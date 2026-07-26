"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { peekMenuReturnPath } from "@/lib/navigation/menu-return";

/** Prefetch the page the user returns to when closing the menu. */
export function MenuReturnPrefetch() {
  const router = useRouter();

  useEffect(() => {
    const returnTo = peekMenuReturnPath();
    router.prefetch(returnTo);
    router.prefetch("/");
  }, [router]);

  return null;
}
