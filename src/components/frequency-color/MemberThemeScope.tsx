"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  applyFrequencyColorVariables,
  clearFrequencyColorVariables,
} from "@/lib/frequency-color/css";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";

type MemberThemeScopeProps = {
  color?: FrequencyColorHex;
  className?: string;
  children: ReactNode;
};

/** Scopes frequency / primary tokens to a member's color (e.g. profile sheet). */
export function MemberThemeScope({ color, className, children }: MemberThemeScopeProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!color) {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    applyFrequencyColorVariables(element, color);

    return () => {
      clearFrequencyColorVariables(element);
    };
  }, [color]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
