"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type WelcomeShellProps = {
  children: ReactNode;
  className?: string;
};

export function WelcomeShell({ children, className }: WelcomeShellProps) {
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: light)");

    function applyTheme() {
      document.documentElement.classList.toggle("light-ready", media.matches);
    }

    applyTheme();
    media.addEventListener("change", applyTheme);

    return () => {
      media.removeEventListener("change", applyTheme);
      document.documentElement.classList.remove("light-ready");
    };
  }, []);

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
