import type { MetadataRoute } from "next";
import { getMembersPage } from "@/lib/members";
import { isMemberIndexable } from "@/lib/seo/member";
import { getSiteUrl } from "@/lib/supabase/env";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/menu/",
        "/messages/",
        "/login",
        "/signup",
        "/welcome",
        "/onboarding",
        "/discover",
        "/me",
        "/bands/",
        "/support/thanks",
        "/auth/",
        "/api/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
