"use client";

import { useEffect } from "react";

export function useScrollToTop(trigger: unknown) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [trigger]);
}
