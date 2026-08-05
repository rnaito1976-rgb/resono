import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DiscoverConversationLoader } from "@/components/discover/DiscoverDialogueLoader";
import { createNoIndexMetadata } from "@/lib/seo/metadata";
import { getViewerContext } from "@/lib/members/viewer-context";

export const metadata: Metadata = createNoIndexMetadata("Discover");

export default async function DiscoverPage() {
  const { user, member } = await getViewerContext();

  if (!user) {
    redirect("/login");
  }

  if (!member) {
    redirect("/welcome");
  }

  return <DiscoverConversationLoader memberId={member.id} initialMember={member} />;
}
