"use client";

import Image from "next/image";
import { RECOMMENDED_PHOTO_SAMPLES } from "@/lib/profile-photo/constants";

export function ProfilePhotoSamples() {
  return (
    <div className="space-y-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
        おすすめの写真
      </p>
      <div className="grid grid-cols-2 gap-3">
        {RECOMMENDED_PHOTO_SAMPLES.map((sample) => (
          <div key={sample.id} className="space-y-2">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-white/[0.04]">
              <Image
                src={sample.image}
                alt={sample.label}
                fill
                className="object-cover"
                sizes="160px"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
            <p className="text-[12px] leading-snug text-white/55">{sample.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
