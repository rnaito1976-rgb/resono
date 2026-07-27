import { redirect } from "next/navigation";
import { WelcomeFlow } from "@/components/welcome/WelcomeFlow";
import { getMembersPage } from "@/lib/members";
import { getAuthSession } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const [user, membersPage] = await Promise.all([
    getAuthSession(),
    getMembersPage(0, 12),
  ]);

  if (user) {
    redirect("/");
  }

  return (
    <WelcomeFlow initialUser={user} members={membersPage.members} />
  );
}
