import { redirect } from "next/navigation";
import { DiscoverConversationLoader } from "@/components/discover/DiscoverDialogueLoader";
import { getViewerContext } from "@/lib/members/viewer-context";

export default async function DiscoverPage() {
  const { user, member } = await getViewerContext();

  if (!user) {
    redirect("/login");
  }

  if (!member) {
    redirect("/onboarding");
  }

  return <DiscoverConversationLoader memberId={member.id} initialMember={member} />;
}
