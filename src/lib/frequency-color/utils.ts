import type { FrequencyColorHex } from "@/lib/frequency-color/types";

export function hexToRgb(hex: FrequencyColorHex): { r: number; g: number; b: number } {
  return {
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  };
}

export function hexToHslString(hex: FrequencyColorHex): string {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case rn:
        h = ((gn - bn) / delta) % 6;
        break;
      case gn:
        h = (bn - rn) / delta + 2;
        break;
      default:
        h = (rn - gn) / delta + 4;
        break;
    }

    h *= 60;
    if (h < 0) {
      h += 360;
    }
  }

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function getFrequencyForegroundHsl(hex: FrequencyColorHex): string {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "0 0% 4%" : "0 0% 98%";
}

export function withAlpha(hex: FrequencyColorHex, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Placeholder for resonance-blend generation. */
export function blendFrequencyColors(
  left: FrequencyColorHex,
  right: FrequencyColorHex
): FrequencyColorHex {
  const a = hexToRgb(left);
  const b = hexToRgb(right);
  const mix = (valueA: number, valueB: number) =>
    Math.round((valueA + valueB) / 2)
      .toString(16)
      .padStart(2, "0");

  return `#${mix(a.r, b.r)}${mix(a.g, b.g)}${mix(a.b, b.b)}` as FrequencyColorHex;
}
