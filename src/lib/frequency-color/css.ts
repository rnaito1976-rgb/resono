import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import {
  getFrequencyForegroundHsl,
  hexToHslString,
  withAlpha,
} from "@/lib/frequency-color/utils";

export function applyFrequencyColorVariables(
  element: HTMLElement,
  hex: FrequencyColorHex
): void {
  element.style.setProperty("--frequency-color", hex);
  element.style.setProperty("--primary", hexToHslString(hex));
  element.style.setProperty("--accent", hexToHslString(hex));
  element.style.setProperty("--ring", hexToHslString(hex));
  element.style.setProperty("--primary-foreground", getFrequencyForegroundHsl(hex));
  element.style.setProperty("--frequency-color-soft", withAlpha(hex, 0.12));
  element.style.setProperty("--frequency-color-muted", withAlpha(hex, 0.4));
}

export function clearFrequencyColorVariables(element: HTMLElement): void {
  element.style.removeProperty("--frequency-color");
  element.style.removeProperty("--frequency-color-soft");
  element.style.removeProperty("--frequency-color-muted");
  element.style.removeProperty("--primary");
  element.style.removeProperty("--primary-foreground");
  element.style.removeProperty("--accent");
  element.style.removeProperty("--ring");
}
