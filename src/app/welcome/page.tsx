import { WelcomeHero } from "@/components/welcome/WelcomeHero";
import { WelcomeProfileBackdrop } from "@/components/welcome/WelcomeProfileBackdrop";
import { getMembersPage } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const [supabase, membersPage] = await Promise.all([
    createClient(),
    getMembersPage(0, 3),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <WelcomeHero
      initialUser={user}
      backdrop={<WelcomeProfileBackdrop members={membersPage.members} />}
    />
  );
}
