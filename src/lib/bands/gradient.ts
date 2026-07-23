import type { CSSProperties } from "react";
import { DEFAULT_FREQUENCY_COLOR } from "@/lib/frequency-color/palette";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { withAlpha } from "@/lib/frequency-color/utils";

export function buildBandGradientStyle(colors: FrequencyColorHex[]): CSSProperties {
  const palette =
    colors.length > 0
      ? colors
      : ([DEFAULT_FREQUENCY_COLOR] as FrequencyColorHex[]);

  const unique = [...new Set(palette)].slice(0, 5);
  const blobs = unique
    .map((color, index) => {
      const x = 18 + index * (64 / Math.max(unique.length - 1, 1));
      return `radial-gradient(circle at ${x}% 20%, ${withAlpha(color, 0.42)} 0%, transparent 58%)`;
    })
    .join(", ");

  return {
    backgroundImage: `${blobs}, linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.92) 100%)`,
    backgroundColor: "#0A0A0A",
  };
}

export function formatBandGradientLabel(colors: FrequencyColorHex[]): string {
  if (colors.length === 0) {
    return "Band Gradient";
  }

  return colors
    .slice(0, 3)
    .map((hex) => hex.replace("#", "").slice(0, 6))
    .join(" × ");
}
