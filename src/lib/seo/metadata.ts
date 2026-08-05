import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/supabase/env";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, TITLE_SUFFIX } from "@/lib/seo/site";

type PageMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  robots?: Metadata["robots"];
  openGraphType?: "website" | "article" | "profile";
};

function resolveCanonicalUrl(path?: string): string {
  const base = getSiteUrl().replace(/\/$/, "");
  if (!path || path === "/") {
    return `${base}/`;
  }

  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function resolveTitle(title?: string): string {
  if (!title) {
    return DEFAULT_TITLE;
  }

  if (title.includes(TITLE_SUFFIX)) {
    return title;
  }

  return `${title}｜${TITLE_SUFFIX}`;
}

export function createPageMetadata(input: PageMetadataInput = {}): Metadata {
  const title = resolveTitle(input.title);
  const description = input.description ?? DEFAULT_DESCRIPTION;
  const canonical = resolveCanonicalUrl(input.path);
  const openGraphType = input.openGraphType ?? "website";

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: input.robots,
    openGraph: {
      type: openGraphType,
      locale: "ja_JP",
      url: canonical,
      siteName: TITLE_SUFFIX,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const NOINDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};

export function createNoIndexMetadata(title: string): Metadata {
  return createPageMetadata({
    title,
    robots: NOINDEX_ROBOTS,
  });
}

export function getMetadataBase(): URL {
  return new URL(`${getSiteUrl().replace(/\/$/, "")}/`);
}
