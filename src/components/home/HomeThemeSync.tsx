"use client";

import { useEffect } from "react";
import { useFrequencyColor } from "@/components/frequency-color/FrequencyColorProvider";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";

type HomeThemeSyncProps = {
  color: FrequencyColorHex;
};

export function HomeThemeSync({ color }: HomeThemeSyncProps) {
  const { setColor } = useFrequencyColor();

  useEffect(() => {
    setColor(color);
  }, [color, setColor]);

  return null;
}
