import type { FrequencyColorHex, FrequencyColorSwatch } from "@/lib/frequency-color/types";

export const DEFAULT_FREQUENCY_COLOR: FrequencyColorHex = "#5EF2C8";

export const FREQUENCY_COLOR_PALETTE: readonly FrequencyColorSwatch[] = [
  { id: "mint", hex: "#5EF2C8", label: "Mint" },
  { id: "aqua", hex: "#6EE7FF", label: "Aqua" },
  { id: "sky", hex: "#7EB6FF", label: "Sky" },
  { id: "violet", hex: "#B388FF", label: "Violet" },
  { id: "lavender", hex: "#C4A7FF", label: "Lavender" },
  { id: "rose", hex: "#FF8FAB", label: "Rose" },
  { id: "coral", hex: "#FF8A65", label: "Coral" },
  { id: "peach", hex: "#FFB085", label: "Peach" },
  { id: "gold", hex: "#FBBF24", label: "Gold" },
  { id: "lime", hex: "#BEF264", label: "Lime" },
  { id: "jade", hex: "#34D399", label: "Jade" },
  { id: "emerald", hex: "#2DD4BF", label: "Emerald" },
  { id: "cyan", hex: "#22D3EE", label: "Cyan" },
  { id: "blue", hex: "#60A5FA", label: "Blue" },
  { id: "pink", hex: "#F472B6", label: "Pink" },
  { id: "silver", hex: "#CBD5E1", label: "Silver" },
] as const;

const paletteHexSet = new Set(FREQUENCY_COLOR_PALETTE.map((swatch) => swatch.hex));

export function isValidFrequencyColor(value: string): value is FrequencyColorHex {
  return /^#[0-9A-Fa-f]{6}$/.test(value) && paletteHexSet.has(value as FrequencyColorHex);
}

export function getFrequencySwatch(
  hex: FrequencyColorHex
): FrequencyColorSwatch | undefined {
  return FREQUENCY_COLOR_PALETTE.find((swatch) => swatch.hex === hex);
}
