"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { SelectableChip } from "@/components/onboarding/SelectableChip";
import { cn } from "@/lib/utils";

type WelcomeTagMultiPickerProps = {
  presets: readonly string[];
  selected: string[];
  placeholder: string;
  onChange: (next: string[]) => void;
  maxSelected?: number;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function WelcomeTagMultiPicker({
  presets,
  selected,
  placeholder,
  onChange,
  maxSelected,
}: WelcomeTagMultiPickerProps) {
  const [query, setQuery] = useState("");
  const atMax = maxSelected ? selected.length >= maxSelected : false;

  const suggestions = useMemo(() => {
    const normalized = normalize(query);
    const pool = normalized
      ? presets.filter((item) => item.toLowerCase().includes(normalized))
      : presets;

    return pool.filter((item) => !selected.includes(item));
  }, [presets, query, selected]);

  const customCandidate = useMemo(() => {
    const value = query.trim();
    if (!value || atMax) {
      return null;
    }

    const exists =
      presets.some((item) => normalize(item) === normalize(value)) ||
      selected.some((item) => normalize(item) === normalize(value));

    return exists ? null : value;
  }, [atMax, presets, query, selected]);

  function addItem(name: string) {
    const value = name.trim();
    if (!value || selected.includes(value) || atMax) {
      return;
    }

    onChange([...selected, value]);
    setQuery("");
  }

  function removeItem(name: string) {
    onChange(selected.filter((item) => item !== name));
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => removeItem(item)}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-[var(--frequency-color-soft)] px-3 py-1.5 text-[14px] text-foreground transition-quiet active:opacity-80"
            >
              {item}
              <X className="h-3.5 w-3.5 opacity-70" strokeWidth={2} />
            </button>
          ))}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <div className="flex flex-wrap gap-2.5 pb-2">
          {customCandidate ? (
            <button
              type="button"
              onClick={() => addItem(customCandidate)}
              className="rounded-full border border-dashed border-primary/40 px-4 py-2.5 text-[15px] text-primary transition-quiet active:opacity-85"
            >
              + {customCandidate}
            </button>
          ) : null}

          {suggestions.map((item) => (
            <SelectableChip
              key={item}
              label={item}
              selected={false}
              onToggle={() => !atMax && addItem(item)}
            />
          ))}
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full shrink-0 rounded-2xl border border-border bg-subtle px-4 py-3.5 text-[16px] outline-none transition-quiet placeholder:text-muted focus:border-primary/35 focus:ring-1 focus:ring-primary/15",
          atMax && "opacity-60"
        )}
        disabled={atMax}
      />
    </div>
  );
}
