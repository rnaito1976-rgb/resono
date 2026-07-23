import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { withAlpha } from "@/lib/frequency-color/utils";

type ProfilePhotoRingProps = {
  color?: FrequencyColorHex;
  className?: string;
  children: React.ReactNode;
};

export function ProfilePhotoRing({
  color,
  className = "",
  children,
}: ProfilePhotoRingProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={
        color
          ? {
              boxShadow: `0 0 0 2px ${withAlpha(color, 0.35)}, 0 0 24px ${withAlpha(color, 0.18)}`,
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
