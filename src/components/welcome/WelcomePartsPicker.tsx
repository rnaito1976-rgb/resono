"use client";

import { useState } from "react";
import { SelectableChip } from "@/components/onboarding/SelectableChip";
import {
  WelcomePickerSection,
} from "@/components/welcome/WelcomePickerSection";
import {
  WELCOME_OTHER_PART_LABEL,
  WELCOME_PART_GROUPS,
  WELCOME_PART_PRESETS,
} from "@/lib/welcome/onboarding-data";

type WelcomePartsPickerProps = {
  selected: string[];
  onChange: (next: string[]) => void;
};

const PRESET_SET = new Set<string>(WELCOME_PART_PRESETS);

function isPresetPart(part: string) {
  return PRESET_SET.has(part);
}

export function WelcomePartsPicker({ selected, onChange }: WelcomePartsPickerProps) {
  const [otherText, setOtherText] = useState("");

  const presetSelected = selected.filter((part) => isPresetPart(part));
  const customParts = selected.filter((part) => !isPresetPart(part));
  const otherSelected = presetSelected.includes(WELCOME_OTHER_PART_LABEL) || customParts.length > 0;

  function togglePart(part: string) {
    if (part === WELCOME_OTHER_PART_LABEL) {
      if (otherSelected) {
        onChange(selected.filter((entry) => isPresetPart(entry) && entry !== WELCOME_OTHER_PART_LABEL));
        setOtherText("");
        return;
      }

      onChange([...selected.filter((entry) => !isPresetPart(entry)), WELCOME_OTHER_PART_LABEL]);
      return;
    }

    onChange(
      selected.includes(part)
        ? selected.filter((entry) => entry !== part)
        : [...selected, part]
    );
  }

  function commitOtherPart() {
    const value = otherText.trim();
    if (!value) {
      return;
    }

    const presetsOnly = selected.filter(
      (entry) => isPresetPart(entry) && entry !== WELCOME_OTHER_PART_LABEL
    );
    onChange([...presetsOnly, WELCOME_OTHER_PART_LABEL, value]);
    setOtherText("");
  }

  const visibleGroups = WELCOME_PART_GROUPS;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-8 overflow-y-auto pb-2 scrollbar-hide">
        {visibleGroups.map((group) => {
          if (group.label === "Other") {
            return (
              <WelcomePickerSection key={group.label} label={group.label}>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2.5">
                    <SelectableChip
                      label="Other（自由入力）"
                      selected={otherSelected}
                      onToggle={() => togglePart(WELCOME_OTHER_PART_LABEL)}
                    />
                  </div>

                  {customParts.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {customParts.map((part) => (
                        <span
                          key={part}
                          className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 text-[14px]"
                        >
                          {part}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {otherSelected ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otherText}
                        onChange={(event) => setOtherText(event.target.value)}
                        placeholder="パートを入力"
                        className="min-w-0 flex-1 rounded-2xl border border-border bg-subtle px-4 py-3.5 text-[16px] outline-none transition-quiet placeholder:text-muted focus:border-primary/35 focus:ring-1 focus:ring-primary/15"
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            commitOtherPart();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={commitOtherPart}
                        disabled={!otherText.trim()}
                        className="shrink-0 rounded-full border border-border px-4 py-3 text-[14px] text-primary transition-quiet disabled:opacity-40"
                      >
                        追加
                      </button>
                    </div>
                  ) : null}
                </div>
              </WelcomePickerSection>
            );
          }

          return (
            <WelcomePickerSection key={group.label} label={group.label}>
              <div className="flex flex-wrap gap-2.5">
                {group.items.map((part) => (
                  <SelectableChip
                    key={part}
                    label={part}
                    selected={selected.includes(part)}
                    onToggle={() => togglePart(part)}
                  />
                ))}
              </div>
            </WelcomePickerSection>
          );
        })}
      </div>
    </div>
  );
}
