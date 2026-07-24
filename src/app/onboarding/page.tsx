import { redirect } from "next/navigation";
import { DiscoverDialogueLoader } from "@/components/discover/DiscoverDialogueLoader";
import { ensureMemberForUser } from "@/lib/members";
import {
  isOnboardingComplete,
  needsFrequencyColorSelection,
} from "@/lib/onboarding/status";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const member = await ensureMemberForUser(user.id, user.email);

  if (member && isOnboardingComplete(member)) {
    redirect("/");
  }

  return (
    <DiscoverDialogueLoader
      mode="onboarding"
      memberId={member?.id ?? user.id}
      initialPhase={
        member && needsFrequencyColorSelection(member) ? "frequency" : "dialogue"
      }
    />
  );
}
