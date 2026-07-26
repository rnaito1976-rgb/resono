"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type WelcomeShellProps = {
  children: ReactNode;
  className?: string;
};

export function WelcomeShell({ children, className }: WelcomeShellProps) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-dvh w-full max-w-mobile flex-col bg-background text-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}
