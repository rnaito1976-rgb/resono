import { buildBandGradientStyle } from "@/lib/bands/gradient";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { cn } from "@/lib/utils";

type BandGradientThumbnailProps = {
  colors?: FrequencyColorHex[];
  className?: string;
  /** sm: 44px circle (feeds), md: 56px rounded square (live) */
  size?: "sm" | "md";
};

export function BandGradientThumbnail({
  colors = [],
  className,
  size = "md",
}: BandGradientThumbnailProps) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden",
        size === "sm" ? "h-11 w-11 rounded-full" : "h-14 w-14 rounded-[14px]",
        className
      )}
      style={buildBandGradientStyle(colors)}
      aria-hidden
    />
  );
}
