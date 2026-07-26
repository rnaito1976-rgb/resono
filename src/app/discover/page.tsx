import { redirect } from "next/navigation";
import { DiscoverConversationLoader } from "@/components/discover/DiscoverDialogueLoader";
import { getMemberByUserId } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const member = await getMemberByUserId(user.id);

  if (!member) {
    redirect("/onboarding");
  }

  return <DiscoverConversationLoader member={member} />;
}
