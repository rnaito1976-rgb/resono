"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { SelectableChip } from "@/components/onboarding/SelectableChip";
import { WelcomePickerSection } from "@/components/welcome/WelcomePickerSection";
import type { CommunityCatalogKey } from "@/lib/catalog/community-catalog";
import { isInStaticCatalog } from "@/lib/catalog/community-catalog";
import { useCommunityCatalog } from "@/hooks/useCommunityCatalog";
import { PROFILE_GROW_OTHER_LABEL } from "@/lib/profile/grow/catalogs";
import {
  PROFILE_GROW_NONE_LABEL,
  applyNoneAwareSelection,
  isProfileGrowNoneLabel,
} from "@/lib/profile/grow/selection";
import { MOBILE_TOUCH_INPUT_CLASS } from "@/lib/mobile/input-classes";
import type { WelcomeOptionGroup } from "@/lib/welcome/onboarding-data";
import { cn } from "@/lib/utils";

type ProfileGrowSearchPickerProps = {
  catalogKey: CommunityCatalogKey;
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
  catalogKey,
  groups: baseGroups,
  catalog: baseCatalog,
  selected,
  onChange,
  placeholder = "検索",
  max = 8,
  listMaxHeight = 220,
}: ProfileGrowSearchPickerProps) {
  const [query, setQuery] = useState("");
  const [otherText, setOtherText] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);

  const { catalog, groups, recordCustomItem } = useCommunityCatalog({
    catalogKey,
    baseCatalog,
    baseGroups,
  });

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

  const customCandidate = useMemo(() => {
    const value = query.trim();
    if (!value || atMax || searchMatch) {
      return null;
    }

    const exists =
      selected.some((item) => normalize(item) === normalize(value)) ||
      catalog.some((item) => normalize(item) === normalize(value));

    return exists ? null : value;
  }, [atMax, catalog, query, searchMatch, selected]);

  function addValue(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    if (isProfileGrowNoneLabel(trimmed)) {
      onChange(applyNoneAwareSelection(selected, trimmed));
      setQuery("");
      return;
    }

    if (atMax) {
      return;
    }

    if (selected.some((item) => normalize(item) === normalize(trimmed))) {
      setQuery("");
      return;
    }

    onChange(applyNoneAwareSelection(selected, trimmed));
    if (!isInStaticCatalog(trimmed, baseCatalog)) {
      recordCustomItem(trimmed);
    }
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
        style={{ height: listMaxHeight, maxHeight: listMaxHeight }}
      >
        <div className="space-y-6 pb-2">
          <div className="flex flex-wrap gap-2.5">
            <SelectableChip
              label={PROFILE_GROW_NONE_LABEL}
              selected={selected.some(isProfileGrowNoneLabel)}
              onToggle={() => addValue(PROFILE_GROW_NONE_LABEL)}
            />
          </div>

          {searchMatch && !selected.includes(searchMatch) ? (
            <div className="flex flex-wrap gap-2.5">
              <SelectableChip
                label={searchMatch}
                selected={false}
                onToggle={() => !atMax && addValue(searchMatch)}
              />
            </div>
          ) : null}

          {customCandidate ? (
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => addValue(customCandidate)}
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

          {filteredGroups.length === 0 && !searchMatch && !customCandidate ? (
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
            } else if (customCandidate) {
              addValue(customCandidate);
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
