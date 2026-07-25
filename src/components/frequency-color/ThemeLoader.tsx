"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { applyFrequencyColorVariables } from "@/lib/frequency-color/css";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";

/** Non-blocking theme load for pages that don't use home bootstrap. */
export function ThemeLoader() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") {
      return;
    }

    let cancelled = false;

    void fetch("/api/theme")
      .then((response) => response.json())
      .then((payload: { color?: FrequencyColorHex }) => {
        if (!cancelled && payload.color) {
          applyFrequencyColorVariables(document.documentElement, payload.color);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
