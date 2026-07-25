"use client";

import { useEffect } from "react";
import { applyFrequencyColorVariables } from "@/lib/frequency-color/css";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { writeStoredThemeColor } from "@/lib/theme/storage";

type HomeThemeSyncProps = {
  color: FrequencyColorHex;
};

export function HomeThemeSync({ color }: HomeThemeSyncProps) {
  useEffect(() => {
    writeStoredThemeColor(color);
    applyFrequencyColorVariables(document.documentElement, color);
  }, [color]);

  return null;
}
