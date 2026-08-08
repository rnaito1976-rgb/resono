"use client";

import { SelectableChip } from "@/components/onboarding/SelectableChip";
import {
  ACTIVITY_STYLE_OPTIONS,
  type ActivityStyleId,
} from "@/lib/music/activity-style";

type ActivityStylePickerProps = {
  value?: ActivityStyleId;
  onChange: (value: ActivityStyleId | undefined) => void;
};

export function ActivityStylePicker({ value, onChange }: ActivityStylePickerProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {ACTIVITY_STYLE_OPTIONS.map((option) => (
        <SelectableChip
          key={option.id}
          label={option.label}
          selected={value === option.id}
          onToggle={() =>
            onChange(value === option.id ? undefined : option.id)
          }
        />
      ))}
    </div>
  );
}
