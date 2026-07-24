import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { HomeFeed } from "@/components/home/HomeFeed";
import { getMemberByUserId } from "@/lib/members";
import { isOnboardingComplete } from "@/lib/onboarding/status";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentMember = user ? await getMemberByUserId(user.id) : undefined;

  if (user && currentMember && !isOnboardingComplete(currentMember)) {
    redirect("/onboarding");
  }

  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <AppHeader initialUser={user} />
      <HomeFeed viewerId={currentMember?.id ?? user?.id} currentMember={currentMember} />
    </main>
  );
}
