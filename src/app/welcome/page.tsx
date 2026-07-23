import { WelcomeHero } from "@/components/welcome/WelcomeHero";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <WelcomeHero initialUser={user} />;
}
