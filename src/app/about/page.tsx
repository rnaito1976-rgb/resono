import type { Metadata } from "next";
import Link from "next/link";
import { AboutExperienceFlow } from "@/components/about/AboutExperienceFlow";
import { AppPageHeader } from "@/components/navigation/AppPageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFooterLinks } from "@/components/seo/SeoFooterLinks";
import { ABOUT_SEO } from "@/lib/seo/about-copy";
import { createPageMetadata } from "@/lib/seo/metadata";
import { getSiteUrl } from "@/lib/supabase/env";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo/site";

export const metadata: Metadata = createPageMetadata({
  title: ABOUT_SEO.metadataTitle,
  description: ABOUT_SEO.metadataDescription,
  path: "/about",
});

export default function AboutPage() {
  const siteUrl = getSiteUrl().replace(/\/$/, "");

  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: ABOUT_SEO.title,
          description: ABOUT_SEO.metadataDescription,
          url: `${siteUrl}/about`,
          isPartOf: {
            "@type": "WebSite",
            name: SITE_NAME,
            url: `${siteUrl}/`,
            description: DEFAULT_DESCRIPTION,
          },
        }}
      />

      <AppPageHeader
        backHref="/"
        backLabel="トップに戻る"
        eyebrow={ABOUT_SEO.eyebrow}
        title={ABOUT_SEO.title}
        subtitle={ABOUT_SEO.lead}
      />

      <article className="space-y-10 px-5 pb-16">
        <AboutExperienceFlow />

        {ABOUT_SEO.sections.map((section) => (
          <section key={section.id} className="space-y-4">
            <h2 className="text-[20px] font-medium tracking-tight text-foreground">
              {section.heading}
            </h2>
            <div className="space-y-4">
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-[16px] leading-[1.85] text-white/70"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        <section className="rounded-[22px] border border-border/80 bg-subtle/60 px-5 py-6">
          <h2 className="text-[18px] font-medium tracking-tight text-foreground">
            音楽仲間を探す
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/60">
            好きなアーティストや活動スタイルから、気になる人を見つけられます。
          </p>
          <Link
            href="/members"
            className="mt-4 inline-flex text-[15px] text-primary transition-colors hover:text-primary/80"
          >
            メンバー一覧を見る
          </Link>
        </section>

        <SeoFooterLinks />
      </article>
    </main>
  );
}
