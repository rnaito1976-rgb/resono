"use client";

import { useMemo, useState } from "react";
import { SelectableChip } from "@/components/onboarding/SelectableChip";
import {
  WelcomePickerSection,
  WelcomeSelectedTags,
} from "@/components/welcome/WelcomePickerSection";
import { isInStaticCatalog } from "@/lib/catalog/community-catalog";
import { useCommunityCatalog } from "@/hooks/useCommunityCatalog";
import {
  PROFILE_GROW_NONE_LABEL,
  applyNoneAwareSelection,
  isProfileGrowNoneLabel,
} from "@/lib/profile/grow/selection";
import { WELCOME_SOUND_GROUPS, WELCOME_SOUND_PRESETS } from "@/lib/welcome/onboarding-data";
import { cn } from "@/lib/utils";

type WelcomeSoundsPickerProps = {
  selected: string[];
  placeholder: string;
  onChange: (next: string[]) => void;
  maxSelected?: number;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function WelcomeSoundsPicker({
  selected,
  placeholder,
  onChange,
  maxSelected,
}: WelcomeSoundsPickerProps) {
  const [query, setQuery] = useState("");
  const { catalog, groups, recordCustomItem } = useCommunityCatalog({
    catalogKey: "genres",
    baseCatalog: WELCOME_SOUND_PRESETS,
    baseGroups: WELCOME_SOUND_GROUPS,
  });

  const atMax = maxSelected ? selected.length >= maxSelected : false;

  const filteredGroups = useMemo(() => {
    const normalized = normalize(query);

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (selected.includes(item)) {
            return false;
          }

          if (!normalized) {
            return true;
          }

          return normalize(item).includes(normalized);
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query, selected]);

  const customCandidate = useMemo(() => {
    const value = query.trim();
    if (!value || atMax) {
      return null;
    }

    const exists =
      catalog.some((item) => normalize(item) === normalize(value)) ||
      selected.some((item) => normalize(item) === normalize(value));

    return exists ? null : value;
  }, [atMax, catalog, query, selected]);

  function toggleItem(name: string) {
    const value = name.trim();
    if (!value) {
      return;
    }

    if (isProfileGrowNoneLabel(value)) {
      onChange(applyNoneAwareSelection(selected, value));
      setQuery("");
      return;
    }

    if (atMax && !selected.includes(value)) {
      return;
    }

    const next = applyNoneAwareSelection(selected, value);
    onChange(next);

    if (!selected.includes(value) && !isInStaticCatalog(value, WELCOME_SOUND_PRESETS)) {
      recordCustomItem(value);
    }

    setQuery("");
  }

  function removeItem(name: string) {
    onChange(selected.filter((item) => item !== name));
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <WelcomeSelectedTags items={selected} onRemove={removeItem} />

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (customCandidate) {
              toggleItem(customCandidate);
            }
          }
        }}
        className={cn(
          "w-full shrink-0 rounded-2xl border border-border bg-subtle px-4 py-3.5 text-[16px] outline-none transition-quiet placeholder:text-muted focus:border-primary/35 focus:ring-1 focus:ring-primary/15",
          atMax && "opacity-60"
        )}
        disabled={atMax}
      />

      <div className="min-h-0 flex-1 overflow-y-auto pb-2 scrollbar-hide">
        <div className="space-y-8">
          <div className="flex flex-wrap gap-2.5">
            <SelectableChip
              label={PROFILE_GROW_NONE_LABEL}
              selected={selected.some(isProfileGrowNoneLabel)}
              onToggle={() => toggleItem(PROFILE_GROW_NONE_LABEL)}
            />
          </div>

          {customCandidate ? (
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => toggleItem(customCandidate)}
                className="rounded-full border border-dashed border-primary/40 px-4 py-2.5 text-[15px] text-primary transition-quiet active:opacity-85"
              >
                + {customCandidate}
              </button>
            </div>
          ) : null}

          {filteredGroups.map((group) => (
            <WelcomePickerSection key={group.label} label={group.label}>
              <div className="flex flex-wrap gap-2.5">
                {group.items.map((item) => (
                  <SelectableChip
                    key={item}
                    label={item}
                    selected={false}
                    onToggle={() => toggleItem(item)}
                  />
                ))}
              </div>
            </WelcomePickerSection>
          ))}

          {filteredGroups.length === 0 && !customCandidate ? (
            <p className="px-1 py-2 text-[14px] text-white/45">
              該当するジャンルが見つかりません
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
