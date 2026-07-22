"use client";

import { useResonance } from "@/hooks/useResonance";

type ResonateButtonProps = {
  memberId: string;
  className?: string;
};

export function ResonateButton({ memberId, className = "" }: ResonateButtonProps) {
  const { isResonated, toggle, mounted } = useResonance(memberId);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={mounted ? isResonated : undefined}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium tracking-wide transition-all active:scale-[0.98] ${
        mounted && isResonated
          ? "border border-accent bg-accent/10 text-accent"
          : "bg-accent text-black"
      } ${className}`}
    >
      {mounted && isResonated ? (
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
}
