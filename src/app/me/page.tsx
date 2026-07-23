import { redirect } from "next/navigation";
import { ensureMemberForUser } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/me");
  }

  const member = await ensureMemberForUser(user.id, user.email);

  if (!member) {
    redirect("/onboarding");
  }

  redirect(`/member/${member.id}`);
}
