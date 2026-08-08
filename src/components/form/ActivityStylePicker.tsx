"use client";

import { SelectableChip } from "@/components/onboarding/SelectableChip";
import {
  ACTIVITY_STYLE_OPTIONS,
  type ActivityStyleId,
} from "@/lib/music/activity-style";

type ActivityStylePickerProps = {
  value?: ActivityStyleId[];
  onChange: (value: ActivityStyleId[]) => void;
};

export function ActivityStylePicker({ value = [], onChange }: ActivityStylePickerProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {ACTIVITY_STYLE_OPTIONS.map((option) => {
        const selected = value.includes(option.id);

        return (
          <SelectableChip
            key={option.id}
            label={option.label}
            selected={selected}
            onToggle={() => {
              if (selected) {
                onChange(value.filter((item) => item !== option.id));
                return;
              }

              onChange([...value, option.id]);
            }}
          />
        );
      })}
    </div>
  );
}
