import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WelcomeFlow } from "@/components/welcome/WelcomeFlow";
import { getMembersPage } from "@/lib/members";
import { createNoIndexMetadata } from "@/lib/seo/metadata";
import { getAuthSession } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createNoIndexMetadata("はじめる");

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
