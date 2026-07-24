import { redirect } from "next/navigation";
import { DiscoverDialogueLoader } from "@/components/discover/DiscoverDialogueLoader";
import { getMemberByUserId } from "@/lib/members";
import { isOnboardingComplete } from "@/lib/onboarding/status";
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

  if (!member || !isOnboardingComplete(member)) {
    redirect("/onboarding");
  }

  return <DiscoverDialogueLoader mode="discover" memberId={member.id} />;
}
