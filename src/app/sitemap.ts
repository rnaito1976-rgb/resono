import type { MetadataRoute } from "next";
import { getMembersPage } from "@/lib/members";
import { isMemberIndexable } from "@/lib/seo/member";
import { getSiteUrl } from "@/lib/supabase/env";

const STATIC_PATHS = ["/", "/about", "/members", "/support"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().replace(/\/$/, "");
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: path === "/" ? `${base}/` : `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.8,
  }));

  let memberEntries: MetadataRoute.Sitemap = [];

  try {
    const { members } = await getMembersPage(0, 500);
    memberEntries = members
      .filter(isMemberIndexable)
      .map((member) => ({
        url: `${base}/member/${member.id}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch (error) {
    console.error("[sitemap] member fetch failed:", error);
  }

  return [...staticEntries, ...memberEntries];
}
