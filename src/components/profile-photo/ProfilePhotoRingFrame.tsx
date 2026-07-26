"use client";

import type { ReactNode } from "react";

type ProfilePhotoRingFrameProps = {
  visible?: boolean;
  className?: string;
  children: ReactNode;
};

export function ProfilePhotoRingFrame({
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
      <div
        className={`relative overflow-hidden ring-2 ring-primary/35 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
