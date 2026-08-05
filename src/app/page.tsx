import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { HomePageContent, HomePageFallback } from "@/components/home/HomePageContent";
import { createPageMetadata } from "@/lib/seo/metadata";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "@/lib/seo/site";
import { getSiteUrl } from "@/lib/supabase/env";

export const metadata: Metadata = createPageMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: "/",
});

export default function HomePage() {
  const siteUrl = getSiteUrl().replace(/\/$/, "");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "RESONO",
          alternateName: "レゾノ",
          url: `${siteUrl}/`,
          description: DEFAULT_DESCRIPTION,
          inLanguage: "ja-JP",
        }}
      />
      <Suspense fallback={<HomePageFallback />}>
        <HomePageContent />
      </Suspense>
    </>
  );
}
