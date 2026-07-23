"use client";

import { useFrequencyColor } from "@/components/frequency-color/FrequencyColorProvider";

type FrequencySpinnerProps = {
  size?: number;
  className?: string;
};

export function FrequencySpinner({ size = 18, className = "" }: FrequencySpinnerProps) {
  const { color } = useFrequencyColor();

  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-white/15 ${className}`}
      style={{
        width: size,
        height: size,
        borderTopColor: color,
      }}
      aria-hidden
    />
  );
}
