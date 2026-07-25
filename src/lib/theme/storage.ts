import type { FrequencyColorHex } from "@/lib/frequency-color/types";

const THEME_STORAGE_KEY = "resono:theme-color";

export function readStoredThemeColor(): FrequencyColorHex | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = sessionStorage.getItem(THEME_STORAGE_KEY);
    return value ? (value as FrequencyColorHex) : null;
  } catch {
    return null;
  }
}

export function writeStoredThemeColor(color: FrequencyColorHex) {
  try {
    sessionStorage.setItem(THEME_STORAGE_KEY, color);
  } catch {
    // Ignore quota errors.
  }
}
