import { redirect } from "next/navigation";
import { OnboardingRegistrationLoader } from "@/components/discover/DiscoverDialogueLoader";
import { ensureMemberForUser } from "@/lib/members";
import { needsFrequencyColorSelection } from "@/lib/onboarding/status";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OnboardingPageProps = {
  searchParams: Promise<{ skipPhoto?: string; phase?: string }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const { skipPhoto, phase } = await searchParams;
  const isWelcomeOnboarding = skipPhoto === "1";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const member = await ensureMemberForUser(user.id, user.email);

  const initialPhase =
    !isWelcomeOnboarding &&
    (phase === "frequency" || (member && needsFrequencyColorSelection(member)))
      ? "frequency"
      : "registration";

  return (
    <OnboardingRegistrationLoader
      memberId={member?.id ?? user.id}
      initialPhase={initialPhase}
      skipPhoto={skipPhoto === "1"}
    />
  );
}
