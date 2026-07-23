import { WelcomeHero } from "@/components/welcome/WelcomeHero";
import { getMembers } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const [members, supabase] = await Promise.all([getMembers(), createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <WelcomeHero initialUser={user} members={members} />;
}
