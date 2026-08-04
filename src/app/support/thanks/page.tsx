import type { Metadata } from "next";
import Link from "next/link";
import { AppPageHeader } from "@/components/navigation/AppPageHeader";
import { Button } from "@/components/ui/button";
import { SUPPORT_COPY } from "@/lib/support/copy";

export const metadata: Metadata = {
  title: "ありがとう | Resono",
};

export default function SupportThanksPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <AppPageHeader eyebrow={SUPPORT_COPY.eyebrow} title={SUPPORT_COPY.thanksTitle} />

      <div className="space-y-10 px-5 pb-16">
        <div className="space-y-4 rounded-[24px] border border-border/80 bg-subtle/60 px-6 py-8">
          {SUPPORT_COPY.thanksBody.map((paragraph) => (
            <p
              key={paragraph}
              className="text-[16px] leading-[1.85] text-white/70"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <Button asChild size="lg" className="w-full tracking-wide">
          <Link href="/">{SUPPORT_COPY.thanksCta}</Link>
        </Button>
      </div>
    </main>
  );
}
