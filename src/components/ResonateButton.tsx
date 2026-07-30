"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { memo } from "react";
import { FrequencySpinner } from "@/components/frequency-color/FrequencySpinner";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useResonance } from "@/hooks/useResonance";
import { buildLoginHref } from "@/lib/navigation/login-redirect";
import type { ResonanceStatus } from "@/lib/resonance/status";

type ResonateButtonProps = {
  memberId: string;
  className?: string;
  initialStatus?: ResonanceStatus;
};

export const ResonateButton = memo(function ResonateButton({
  memberId,
  className = "",
  initialStatus,
}: ResonateButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn } = useAuthUser();
  const { isResonated, isMutual, conversationId, toggle, mounted, isPending } =
    useResonance(memberId, initialStatus);

  function handleToggle() {
    if (!isLoggedIn) {
      router.push(buildLoginHref(pathname));
      return;
    }

    toggle();
  }

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
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={mounted ? isResonated : undefined}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium tracking-wide transition-quiet active:opacity-85 disabled:opacity-60 ${
        mounted && isResonated
          ? "border border-primary/40 bg-primary/10 text-primary"
          : "bg-primary text-primary-foreground"
      } ${className}`}
    >
      {isPending ? (
        <>
          <FrequencySpinner size={16} />
          共鳴しています
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
