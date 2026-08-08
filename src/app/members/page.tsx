import type { Metadata } from "next";
import { MembersPageContent } from "@/components/members/MembersPageContent";
import { getMembersPage, getRecentMembers, getTodayMembers } from "@/lib/members";
import { MEMBERS_SEO } from "@/lib/seo/about-copy";
import { isMemberIndexable } from "@/lib/seo/member";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: MEMBERS_SEO.metadataTitle,
  description: MEMBERS_SEO.metadataDescription,
  path: "/members",
});

export default async function MembersPage() {
  const [{ members }, todayMembers, recentMembers] = await Promise.all([
    getMembersPage(0, 48),
    getTodayMembers(4),
    getRecentMembers(4),
  ]);
  const indexableMembers = members.filter(isMemberIndexable);
  const spotlightMembers =
    todayMembers.length > 0
      ? todayMembers.filter(isMemberIndexable)
      : recentMembers.filter(isMemberIndexable).slice(0, 4);
  const spotlightTitle =
    todayMembers.length > 0 ? "今日登録した人" : "最近参加した人";

  return (
    <MembersPageContent
      members={indexableMembers}
      spotlightMembers={spotlightMembers}
      spotlightTitle={spotlightTitle}
    />
  );
}
