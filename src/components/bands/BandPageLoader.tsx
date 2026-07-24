"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const BandPageClient = dynamic(
  () =>
    import("@/components/bands/BandPageClient").then((module) => ({
      default: module.BandPageClient,
    })),
  {
    loading: () => (
      <div className="mx-auto min-h-dvh max-w-mobile animate-pulse bg-background px-5 py-10">
        <div className="mb-8 h-40 rounded-[32px] bg-white/[0.06]" />
        <div className="space-y-4">
          <div className="h-4 w-32 rounded-full bg-white/[0.08]" />
          <div className="h-24 rounded-[24px] bg-white/[0.05]" />
        </div>
      </div>
    ),
    ssr: false,
  }
);

export function BandPageLoader(props: ComponentProps<typeof BandPageClient>) {
  return <BandPageClient {...props} />;
}
