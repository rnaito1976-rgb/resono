"use server";

import { redirect } from "next/navigation";
import { ensureMemberForUser } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";

export async function initializeMemberProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログイン状態を確認できませんでした" };
  }

  const member = await ensureMemberForUser(user.id, user.email);

  if (!member) {
    return {
      error:
        "プロフィールの作成に失敗しました。Supabase のマイグレーション 004 を実行してください。",
    };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/welcome");
}
