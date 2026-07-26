"use client";

import { FREQUENCY_COLOR_PALETTE } from "@/lib/frequency-color/palette";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { withAlpha } from "@/lib/frequency-color/utils";

type FrequencyColorSwatchGridProps = {
  selected?: FrequencyColorHex;
  onSelect: (color: FrequencyColorHex) => void;
  columns?: 4 | 8;
};

export function FrequencyColorSwatchGrid({
  selected,
  onSelect,
  columns = 8,
}: FrequencyColorSwatchGridProps) {
  return (
    <div
      className={`grid gap-3 ${
        columns === 8 ? "grid-cols-8" : "grid-cols-4"
      }`}
    >
      {FREQUENCY_COLOR_PALETTE.map((swatch) => {
        const isSelected = selected === swatch.hex;

        return (
          <button
            key={swatch.id}
            type="button"
            aria-label={swatch.label}
            aria-pressed={isSelected}
            onClick={() => onSelect(swatch.hex)}
            className={`aspect-square w-full shrink-0 rounded-full transition-quiet active:scale-95 ${
              isSelected ? "scale-105" : ""
            }`}
            style={{
              backgroundColor: swatch.hex,
              boxShadow: isSelected
                ? `0 0 0 2px ${swatch.hex}, 0 0 0 4px ${withAlpha(swatch.hex, 0.25)}`
                : `inset 0 0 0 1px ${withAlpha(swatch.hex, 0.35)}`,
            }}
          />
        );
      })}
    </div>
  );
}
