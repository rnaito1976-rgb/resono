import { redirect } from "next/navigation";
import { getMemberByUserId } from "@/lib/members";
import { ensureMemberForUser } from "@/lib/members";
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

  await ensureMemberForUser(user.id, user.email);
  const member = await getMemberByUserId(user.id);

  if (member?.portrait.dialogueCompleted === true) {
    redirect("/");
  }

  redirect("/welcome");
}
