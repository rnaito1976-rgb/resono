"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureMemberForUser } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/supabase/env";

function sanitizeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

function translateAuthError(message: string): string {
  const translations: Record<string, string> = {
    "Invalid login credentials":
      "メールアドレスまたはパスワードが正しくありません。",
    "Email not confirmed":
      "メールアドレスの確認が完了していません。確認メールのリンクを開いてください。",
    "User already registered": "このメールアドレスはすでに登録されています。",
    "Signup requires a valid password":
      "パスワードは6文字以上で入力してください。",
  };

  return translations[message] ?? message;
}

export async function signInWithEmailAction(
  email: string,
  password: string,
  nextPath?: string
) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect(sanitizeNextPath(nextPath));
}

export async function signUpWithEmailAction(email: string, password: string) {
  const supabase = await createClient();
  const trimmedEmail = email.trim();
  const emailRedirectTo = `${getSiteUrl()}/auth/callback?next=${encodeURIComponent("/onboarding")}`;

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  if (data.user && !data.session) {
    return {
      needsConfirmation: true,
      message:
        "確認メールを送信しました。メール内のリンクをクリックしてからログインしてください。",
    };
  }

  if (!data.user) {
    return { error: "アカウントの作成に失敗しました。" };
  }

  const member = await ensureMemberForUser(data.user.id, trimmedEmail);
  if (!member) {
    return {
      error:
        "プロフィールの作成に失敗しました。時間をおいて再度お試しください。",
    };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

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
        "プロフィールの作成に失敗しました。時間をおいて再度お試しください。",
    };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/welcome");
}
