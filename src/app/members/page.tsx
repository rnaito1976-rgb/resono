import type { Metadata } from "next";
import { MembersPageContent } from "@/components/members/MembersPageContent";
import { getMembersPage } from "@/lib/members";
import { MEMBERS_SEO } from "@/lib/seo/about-copy";
import { isMemberIndexable } from "@/lib/seo/member";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: MEMBERS_SEO.metadataTitle,
  description: MEMBERS_SEO.metadataDescription,
  path: "/members",
});

export default async function MembersPage() {
  const { members } = await getMembersPage(0, 48);
  const indexableMembers = members.filter(isMemberIndexable);

  return <MembersPageContent members={indexableMembers} />;
}
