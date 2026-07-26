"use client";

import type { ReactNode } from "react";
import { WelcomeProfileBackdrop } from "@/components/welcome/WelcomeProfileBackdrop";
import type { Member } from "@/types/member";
import { cn } from "@/lib/utils";

type WelcomeShellProps = {
  children: ReactNode;
  members: Member[];
  className?: string;
};

export function WelcomeShell({ children, members, className }: WelcomeShellProps) {
  return (
    <div
      className={cn(
        "relative mx-auto min-h-dvh w-full max-w-mobile overflow-hidden bg-background text-foreground",
        className
      )}
    >
      <WelcomeProfileBackdrop members={members} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-black/75 via-black/55 to-black/90"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(circle_at_50%_32%,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.78)_72%)]"
      />

      <div className="relative z-10 flex min-h-dvh flex-col">{children}</div>
    </div>
  );
}
