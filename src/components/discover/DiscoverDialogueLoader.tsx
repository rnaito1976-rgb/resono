"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const AIDialogueFlow = dynamic(
  () =>
    import("@/components/discover/AIDialogueFlow").then((module) => ({
      default: module.AIDialogueFlow,
    })),
  {
    loading: () => (
      <div className="mx-auto flex min-h-dvh max-w-mobile items-center justify-center bg-background px-6">
        <p className="text-[14px] text-white/45">読み込んでいます...</p>
      </div>
    ),
    ssr: false,
  }
);

export function DiscoverDialogueLoader(
  props: ComponentProps<typeof AIDialogueFlow>
) {
  return <AIDialogueFlow {...props} />;
}
