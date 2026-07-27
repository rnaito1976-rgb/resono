"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { SelectableChip } from "@/components/onboarding/SelectableChip";
import { WelcomePickerSection } from "@/components/welcome/WelcomePickerSection";
import { PROFILE_GROW_OTHER_LABEL } from "@/lib/profile/grow/catalogs";
import { MOBILE_TOUCH_INPUT_CLASS } from "@/lib/mobile/input-classes";
import type { WelcomeOptionGroup } from "@/lib/welcome/onboarding-data";
import { cn } from "@/lib/utils";

type ProfileGrowSearchPickerProps = {
  groups: readonly WelcomeOptionGroup[];
  catalog: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  max?: number;
  listMaxHeight?: number;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function flattenGroups(groups: readonly WelcomeOptionGroup[]): string[] {
  return groups.flatMap((group) => [...group.items]);
}

export function ProfileGrowSearchPicker({
  groups,
  catalog,
  selected,
  onChange,
  placeholder = "検索",
  max = 8,
  listMaxHeight = 220,
}: ProfileGrowSearchPickerProps) {
  const [query, setQuery] = useState("");
  const [otherText, setOtherText] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);

  const presetSet = useMemo(() => new Set(catalog), [catalog]);
  const atMax = selected.length >= max;
  const hasCustomValues = selected.some((value) => !presetSet.has(value));

  const filteredGroups = useMemo(() => {
    const normalized = normalize(query);

    return groups
      .filter((group) => group.label !== "その他" && group.label !== "Other")
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (item === PROFILE_GROW_OTHER_LABEL || selected.includes(item)) {
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

  const searchMatch = useMemo(() => {
    const value = query.trim();
    if (!value) {
      return null;
    }

    return catalog.find((item) => normalize(item) === normalize(value)) ?? null;
  }, [catalog, query]);

  function addValue(value: string) {
    const trimmed = value.trim();
    if (!trimmed || atMax) {
      return;
    }

    if (selected.some((item) => normalize(item) === normalize(trimmed))) {
      setQuery("");
      return;
    }

    onChange([...selected, trimmed]);
    setQuery("");
  }

  function removeValue(value: string) {
    onChange(selected.filter((item) => item !== value));
  }

  function commitOther() {
    const value = otherText.trim();
    if (!value) {
      return;
    }

    addValue(value);
    setOtherText("");
  }

  return (
    <div className="flex min-h-0 flex-col gap-3">
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => removeValue(value)}
              className="inline-flex min-h-[44px] touch-manipulation items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-3 py-2 text-[16px] text-foreground transition-quiet active:opacity-80"
            >
              {value}
              <X className="h-4 w-4 opacity-70" strokeWidth={2} />
            </button>
          ))}
        </div>
      ) : null}

      <p className="text-[13px] text-white/45">{selected.length}/{max} 選択中</p>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-hide"
        style={{ maxHeight: listMaxHeight }}
      >
        <div className="space-y-6 pb-2">
          {searchMatch && !selected.includes(searchMatch) ? (
            <div className="flex flex-wrap gap-2.5">
              <SelectableChip
                label={searchMatch}
                selected={false}
                onToggle={() => !atMax && addValue(searchMatch)}
              />
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
                    onToggle={() => !atMax && addValue(item)}
                  />
                ))}
              </div>
            </WelcomePickerSection>
          ))}

          <WelcomePickerSection label="その他">
            <div className="space-y-3">
              <SelectableChip
                label="その他（自由入力）"
                selected={showOtherInput || hasCustomValues}
                onToggle={() => {
                  if (showOtherInput || hasCustomValues) {
                    onChange(selected.filter((item) => presetSet.has(item)));
                    setOtherText("");
                    setShowOtherInput(false);
                    return;
                  }

                  setShowOtherInput(true);
                }}
              />

              {!showOtherInput && !hasCustomValues ? (
                <p className="text-[13px] text-white/40">
                  候補にない場合のみ「その他」を選んで入力してください
                </p>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otherText}
                    onChange={(event) => setOtherText(event.target.value)}
                    placeholder="自由入力"
                    enterKeyHint="done"
                    autoComplete="off"
                    className={cn(MOBILE_TOUCH_INPUT_CLASS, "min-w-0 flex-1")}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitOther();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={commitOther}
                    disabled={!otherText.trim() || atMax}
                    className="min-h-[44px] shrink-0 touch-manipulation rounded-full border border-border px-4 py-3 text-[16px] text-primary transition-quiet disabled:opacity-40"
                  >
                    追加
                  </button>
                </div>
              )}
            </div>
          </WelcomePickerSection>

          {filteredGroups.length === 0 && !searchMatch ? (
            <p className="px-1 text-[14px] text-white/45">該当する候補が見つかりません</p>
          ) : null}
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (searchMatch) {
              addValue(searchMatch);
            }
          }
        }}
        className={cn(MOBILE_TOUCH_INPUT_CLASS, atMax && "opacity-60")}
        disabled={atMax}
      />
    </div>
  );
}

export function flattenProfileGrowCatalog(groups: readonly WelcomeOptionGroup[]): string[] {
  return flattenGroups(groups).filter(
    (item) => item !== PROFILE_GROW_OTHER_LABEL && item !== "Other"
  );
}
