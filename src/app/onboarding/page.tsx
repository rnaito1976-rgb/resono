import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMemberByUserId } from "@/lib/members";
import { ensureMemberForUser } from "@/lib/members";
import { createNoIndexMetadata } from "@/lib/seo/metadata";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createNoIndexMetadata("オンボーディング");

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
