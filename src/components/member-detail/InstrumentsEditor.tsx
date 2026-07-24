"use client";

import { useState, useTransition } from "react";
import { ChipGrid } from "@/components/onboarding/SelectableChip";
import { updateInstrumentsAction } from "@/lib/actions/member";
import { PLAYING_PART_OPTIONS } from "@/lib/resonance/dialogue";

type InstrumentsEditorProps = {
  initialInstruments: string[];
};

export function InstrumentsEditor({ initialInstruments }: InstrumentsEditorProps) {
  const [selected, setSelected] = useState(initialInstruments);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleInstrument(instrument: string) {
    const next = selected.includes(instrument)
      ? selected.filter((item) => item !== instrument)
      : [...selected, instrument];

    setSelected(next);
    setError(null);

    startTransition(async () => {
      const result = await updateInstrumentsAction(next);
      if (result.error) {
        setError(result.error);
        setSelected(initialInstruments);
        return;
      }
      if (result.instruments) {
        setSelected(result.instruments);
      }
    });
  }

  return (
    <div className="space-y-3">
      <ChipGrid
        items={PLAYING_PART_OPTIONS}
        selected={selected}
        onToggle={toggleInstrument}
      />
      {isPending ? <p className="text-[13px] text-white/45">保存中...</p> : null}
      {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
    </div>
  );
}
