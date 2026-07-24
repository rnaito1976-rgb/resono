"use client";

import { cn } from "@/lib/utils";

type SelectableChipProps = {
  label: string;
  selected: boolean;
  onToggle: () => void;
};

export function SelectableChip({ label, selected, onToggle }: SelectableChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "rounded-full border px-4 py-2.5 text-[15px] transition-quiet active:opacity-85",
        selected
          ? "border-primary/50 bg-[var(--frequency-color-soft)] text-white"
          : "border-border bg-white/[0.02] text-white/70 hover:border-border hover:bg-white/[0.04]"
      )}
    >
      {label}
    </button>
  );
}

type ChipGridProps = {
  items: readonly string[];
  selected: string[];
  onToggle: (item: string) => void;
  minSelected?: number;
};

export function ChipGrid({ items, selected, onToggle }: ChipGridProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item) => (
        <SelectableChip
          key={item}
          label={item}
          selected={selected.includes(item)}
          onToggle={() => onToggle(item)}
        />
      ))}
    </div>
  );
}
