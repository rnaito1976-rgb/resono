"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SelectableChip } from "@/components/onboarding/SelectableChip";
import { WelcomePickerSection } from "@/components/welcome/WelcomePickerSection";
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
const PRESET_GROUPS = WELCOME_PART_GROUPS.filter((group) => group.label !== "Other");

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function isPresetPart(part: string) {
  return PRESET_SET.has(part);
}

function isDisplayPart(part: string) {
  return part !== WELCOME_OTHER_PART_LABEL;
}

export function WelcomePartsPicker({ selected, onChange }: WelcomePartsPickerProps) {
  const [otherText, setOtherText] = useState("");

  const displaySelected = selected.filter(isDisplayPart);
  const customParts = selected.filter((part) => !isPresetPart(part));
  const otherSelected = selected.includes(WELCOME_OTHER_PART_LABEL) || customParts.length > 0;

  function removePart(part: string) {
    onChange(selected.filter((entry) => entry !== part));
  }

  function toggleOther() {
    if (otherSelected) {
      onChange(
        selected.filter(
          (entry) => isPresetPart(entry) && entry !== WELCOME_OTHER_PART_LABEL
        )
      );
      setOtherText("");
      return;
    }

    onChange(
      selected.includes(WELCOME_OTHER_PART_LABEL)
        ? selected
        : [...selected, WELCOME_OTHER_PART_LABEL]
    );
  }

  function togglePart(part: string) {
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

    if (selected.some((entry) => normalize(entry) === normalize(value))) {
      setOtherText("");
      return;
    }

    const next = selected.includes(WELCOME_OTHER_PART_LABEL)
      ? [...selected, value]
      : [...selected, WELCOME_OTHER_PART_LABEL, value];

    onChange(next);
    setOtherText("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {displaySelected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {displaySelected.map((part) => (
            <button
              key={part}
              type="button"
              onClick={() => removePart(part)}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 text-[14px] text-foreground transition-quiet active:opacity-80"
            >
              {part}
              <X className="h-3.5 w-3.5 opacity-70" strokeWidth={2} />
            </button>
          ))}
        </div>
      ) : null}

      <WelcomePickerSection label="Other">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2.5">
            <SelectableChip
              label="Other（自由入力）"
              selected={otherSelected}
              onToggle={toggleOther}
            />
          </div>

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

      <div className="min-h-0 flex-1 space-y-8 overflow-y-auto pb-2 scrollbar-hide">
        {PRESET_GROUPS.map((group) => (
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
        ))}
      </div>
    </div>
  );
}
