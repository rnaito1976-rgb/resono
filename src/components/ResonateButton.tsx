"use client";

import { memo } from "react";
import Link from "next/link";
import { FrequencySpinner } from "@/components/frequency-color/FrequencySpinner";
import { useResonance } from "@/hooks/useResonance";

type ResonateButtonProps = {
  memberId: string;
  className?: string;
};

export const ResonateButton = memo(function ResonateButton({
  memberId,
  className = "",
}: ResonateButtonProps) {
  const { isResonated, isMutual, conversationId, toggle, mounted, isPending } =
    useResonance(memberId);

  if (mounted && isMutual && conversationId) {
    return (
      <Link
        href={`/messages/${conversationId}`}
        className={`flex h-12 w-full items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/10 text-[15px] font-medium tracking-wide text-primary transition-quiet active:opacity-85 ${className}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        メッセージを送る
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={mounted ? isResonated : undefined}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium tracking-wide transition-quiet active:opacity-85 disabled:opacity-60 ${
        mounted && isResonated
          ? "border border-primary/40 bg-[var(--frequency-color-soft)] text-primary"
          : "bg-primary text-primary-foreground"
      } ${className}`}
    >
      {isPending ? (
        <>
          <FrequencySpinner size={16} />
          処理中...
        </>
      ) : mounted && isResonated ? (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          共鳴済み
        </>
      ) : (
        "共鳴する"
      )}
    </button>
  );
});
