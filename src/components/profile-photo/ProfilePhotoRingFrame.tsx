"use client";

import type { ReactNode } from "react";
import { ProfilePhotoRing } from "@/components/frequency-color/ProfilePhotoRing";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";

type ProfilePhotoRingFrameProps = {
  color?: FrequencyColorHex;
  visible?: boolean;
  className?: string;
  children: ReactNode;
};

export function ProfilePhotoRingFrame({
  color,
  visible = true,
  className = "",
  children,
}: ProfilePhotoRingFrameProps) {
  return (
    <div
      className="transition-opacity ease-in-out"
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: "900ms",
      }}
    >
      <ProfilePhotoRing color={color} className={className}>
        {children}
      </ProfilePhotoRing>
    </div>
  );
}
