import { redirect } from "next/navigation";
import { AIDialogueFlow } from "@/components/discover/AIDialogueFlow";
import { ensureMemberForUser } from "@/lib/members";
import { DEFAULT_PHOTO_URL, isOnboardingComplete } from "@/lib/onboarding/status";
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
    <AIDialogueFlow
      mode="onboarding"
      memberId={member?.id ?? user.id}
      initialPhoto={member?.photo ?? DEFAULT_PHOTO_URL}
    />
  );
}
