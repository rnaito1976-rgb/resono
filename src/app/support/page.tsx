import type { Metadata } from "next";
import { AppPageHeader } from "@/components/navigation/AppPageHeader";
import { SupportAmountPicker } from "@/components/support/SupportAmountPicker";
import { SupportUsageCards } from "@/components/support/SupportUsageCards";
import { SUPPORT_COPY } from "@/lib/support/copy";

export const metadata: Metadata = {
  title: "RESONOを応援する | Resono",
  description: "RESONOの開発を応援する",
};

export default function SupportPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <AppPageHeader
        backHref="/menu"
        backLabel="メニューに戻る"
        eyebrow={SUPPORT_COPY.eyebrow}
        title={SUPPORT_COPY.title}
        subtitle={SUPPORT_COPY.lead}
      />

      <div className="space-y-12 px-5 pb-16">
        <div className="space-y-5">
          {SUPPORT_COPY.intro.map((paragraph) => (
            <p
              key={paragraph}
              className="text-[16px] leading-[1.85] text-white/70"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <SupportUsageCards />
        <SupportAmountPicker />
      </div>
    </main>
  );
}
