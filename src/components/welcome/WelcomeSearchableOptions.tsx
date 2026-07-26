"use client";

import { useMemo, useState } from "react";
import { SelectableChip } from "@/components/onboarding/SelectableChip";
import { cn } from "@/lib/utils";

type WelcomeSearchableOptionsProps = {
  presets: readonly string[];
  selected: string[];
  multi: boolean;
  searchable: boolean;
  placeholder?: string;
  onChange: (next: string[]) => void;
};

function toggleValue(current: string[], value: string, multi: boolean): string[] {
  if (multi) {
    return current.includes(value)
      ? current.filter((entry) => entry !== value)
      : [...current, value];
  }

  return current.includes(value) ? [] : [value];
}

export function WelcomeSearchableOptions({
  presets,
  selected,
  multi,
  searchable,
  placeholder = "検索",
  onChange,
}: WelcomeSearchableOptionsProps) {
  const [query, setQuery] = useState("");

  const filteredPresets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return presets;
    }

    return presets.filter((item) => item.toLowerCase().includes(normalized));
  }, [presets, query]);

  const customCandidates = useMemo(() => {
    const normalized = query.trim();
    if (!normalized || !searchable) {
      return [];
    }

    const exists =
      presets.some((item) => item.toLowerCase() === normalized.toLowerCase()) ||
      selected.some((item) => item.toLowerCase() === normalized.toLowerCase());

    return exists ? [] : [normalized];
  }, [presets, query, searchable, selected]);

  function addCustomValue(value: string) {
    onChange(toggleValue(selected, value, multi));
    setQuery("");
  }

  return (
    <div className="space-y-4">
      {searchable ? (
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-border bg-subtle px-4 py-3.5 text-[16px] outline-none transition-quiet placeholder:text-muted focus:border-primary/35 focus:ring-1 focus:ring-primary/15"
        />
      ) : null}

      <div className="flex flex-wrap gap-2.5">
        {filteredPresets.map((item) => (
          <SelectableChip
            key={item}
            label={item}
            selected={selected.includes(item)}
            onToggle={() => onChange(toggleValue(selected, item, multi))}
          />
        ))}

        {customCandidates.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => addCustomValue(item)}
            className={cn(
              "rounded-full border border-dashed border-primary/40 px-4 py-2.5 text-[15px] text-primary transition-quiet active:opacity-85"
            )}
          >
            + {item}
          </button>
        ))}
      </div>
    </div>
  );
}
