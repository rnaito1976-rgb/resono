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
        "rounded-full border px-4 py-2.5 text-[15px] transition-all active:scale-[0.98]",
        selected
          ? "border-primary bg-primary/15 text-white"
          : "border-white/12 bg-white/[0.03] text-white/75 hover:border-white/25 hover:bg-white/[0.06]"
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
