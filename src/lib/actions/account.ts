"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export async function deleteAccountAction() {
  const user = await getAuthUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  const admin = createAdminClient();
  if (!admin) {
    return {
      error: "現在退会を受け付けできません。しばらくしてからお試しください。",
    };
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("[deleteAccountAction]", error);
    return { error: "退会処理に失敗しました。もう一度お試しください。" };
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/");
}
