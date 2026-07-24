"use client";

import { useEffect, useState, useTransition } from "react";
import { FrequencyColorSwatchGrid } from "@/components/frequency-color/FrequencyColorSwatchGrid";
import { applyFrequencyColorVariables } from "@/lib/frequency-color/css";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { withAlpha } from "@/lib/frequency-color/utils";
import { FrequencySpinner } from "@/components/frequency-color/FrequencySpinner";
import { Button } from "@/components/ui/button";

type FrequencyColorPickerProps = {
  initialColor?: FrequencyColorHex;
  onConfirm: (color: FrequencyColorHex) => Promise<{ error?: string } | void>;
  submitLabel?: string;
};

export function FrequencyColorPicker({
  initialColor,
  onConfirm,
  submitLabel = "この色で始める",
}: FrequencyColorPickerProps) {
  const [selected, setSelected] = useState<FrequencyColorHex | undefined>(
    initialColor
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (selected) {
      applyFrequencyColorVariables(document.documentElement, selected);
    }
  }, [selected]);

  function handleConfirm() {
    if (!selected) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await onConfirm(selected);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-mobile flex-col bg-background px-5 pb-8 pt-14">
      <div className="mb-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          Frequency Color
        </p>
        <h1 className="mt-4 text-[32px] font-light leading-tight tracking-tight text-foreground">
          あなたのFrequency Colorを
          <br />
          選びましょう
        </h1>
        <p className="mt-4 max-w-[28ch] text-[15px] leading-relaxed text-white/45">
          この色はあなただけのサインカラーです。Resonoの体験全体に、静かに反映されます。
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <div className="mx-auto mb-10 flex h-28 w-28 items-center justify-center rounded-full bg-subtle">
          <div
            className="h-16 w-16 rounded-full transition-quiet"
            style={{
              backgroundColor: selected ?? "rgba(255,255,255,0.08)",
              boxShadow: selected
                ? `0 0 0 1px ${withAlpha(selected, 0.35)}, 0 0 32px ${withAlpha(selected, 0.28)}`
                : undefined,
            }}
          />
        </div>

        <FrequencyColorSwatchGrid
          selected={selected}
          onSelect={setSelected}
          columns={4}
        />
      </div>

      <div className="mt-10 space-y-3 border-t border-border pt-6">
        {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
        <Button
          size="lg"
          className="w-full"
          disabled={!selected || isPending}
          onClick={handleConfirm}
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <FrequencySpinner size={16} />
              保存しています...
            </span>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </div>
  );
}
