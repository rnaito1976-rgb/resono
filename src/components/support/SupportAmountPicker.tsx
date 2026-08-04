"use client";

import { useMemo, useState } from "react";
import { SelectableChip } from "@/components/onboarding/SelectableChip";
import { Button } from "@/components/ui/button";
import { SUPPORT_COPY } from "@/lib/support/copy";
import {
  formatSupportAmount,
  getStripeSupportUrl,
  hasAnySupportCheckout,
  SUPPORT_AMOUNTS,
  type SupportAmount,
} from "@/lib/support/stripe-links";
import { cn } from "@/lib/utils";

export function SupportAmountPicker() {
  const [selectedAmount, setSelectedAmount] = useState<SupportAmount | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const checkoutAvailable = useMemo(() => hasAnySupportCheckout(), []);

  function handleSupport() {
    setMessage(null);

    if (!selectedAmount) {
      return;
    }

    const url = getStripeSupportUrl(selectedAmount);
    if (!url) {
      setMessage(SUPPORT_COPY.preparingDetail);
      return;
    }

    window.location.href = url;
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-[13px] font-medium uppercase tracking-[0.18em] text-white/45">
          {SUPPORT_COPY.amountHeading}
        </h2>
        <p className="mt-2 text-[15px] text-white/55">{SUPPORT_COPY.amountHint}</p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {SUPPORT_AMOUNTS.map((amount) => (
          <SelectableChip
            key={amount}
            label={formatSupportAmount(amount)}
            selected={selectedAmount === amount}
            onToggle={() => {
              setSelectedAmount(amount);
              setMessage(null);
            }}
          />
        ))}
      </div>

      {!checkoutAvailable ? (
        <p className="rounded-[16px] border border-border/80 bg-subtle/60 px-4 py-3 text-center text-[14px] leading-relaxed text-white/55">
          {SUPPORT_COPY.preparing}
        </p>
      ) : null}

      <Button
        size="lg"
        className="w-full tracking-wide"
        disabled={selectedAmount === null}
        onClick={handleSupport}
      >
        {SUPPORT_COPY.cta}
      </Button>

      {message ? (
        <p
          role="status"
          className={cn(
            "rounded-[14px] border border-border/80 bg-subtle/70 px-4 py-3 text-center text-[14px] leading-relaxed",
            "text-white/60"
          )}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
