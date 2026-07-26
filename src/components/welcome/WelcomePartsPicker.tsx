"use client";

import { useState } from "react";
import { SelectableChip } from "@/components/onboarding/SelectableChip";
import { WELCOME_PART_PRESETS } from "@/lib/welcome/onboarding-data";

type WelcomePartsPickerProps = {
  selected: string[];
  onChange: (next: string[]) => void;
};

const OTHER_LABEL = "Other";
const PRESET_SET = new Set<string>(WELCOME_PART_PRESETS);

function isPresetPart(part: string) {
  return PRESET_SET.has(part);
}

export function WelcomePartsPicker({ selected, onChange }: WelcomePartsPickerProps) {
  const [otherText, setOtherText] = useState("");

  const presetSelected = selected.filter((part) => isPresetPart(part));
  const customParts = selected.filter((part) => !isPresetPart(part));
  const otherSelected = presetSelected.includes(OTHER_LABEL) || customParts.length > 0;

  function togglePreset(part: string) {
    if (part === OTHER_LABEL) {
      if (otherSelected) {
        onChange(selected.filter((entry) => isPresetPart(entry) && entry !== OTHER_LABEL));
        setOtherText("");
        return;
      }

      onChange([...selected.filter((entry) => !isPresetPart(entry)), OTHER_LABEL]);
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

    const presetsOnly = selected.filter((entry) => isPresetPart(entry) && entry !== OTHER_LABEL);
    onChange([...presetsOnly, OTHER_LABEL, value]);
    setOtherText("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2.5">
        {WELCOME_PART_PRESETS.map((part) => (
          <SelectableChip
            key={part}
            label={part}
            selected={part === OTHER_LABEL ? otherSelected : selected.includes(part)}
            onToggle={() => togglePreset(part)}
          />
        ))}
      </div>

      {customParts.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {customParts.map((part) => (
            <span
              key={part}
              className="rounded-full border border-primary/35 bg-[var(--frequency-color-soft)] px-3 py-1.5 text-[14px]"
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
  );
}
