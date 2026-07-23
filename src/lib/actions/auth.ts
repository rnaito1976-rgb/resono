"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureMemberForUser } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";
import { getEmailRedirectUrl } from "@/lib/supabase/env";

function sanitizeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }

  return next;
}

function translateAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("rate limit") ||
    normalized.includes("over_email_send_rate_limit")
  ) {
    return "確認メールの送信上限に達しました。1時間ほど待ってから再試行するか、Googleログインをご利用ください。";
  }

  const translations: Record<string, string> = {
    "Invalid login credentials":
      "メールアドレスまたはパスワードが正しくありません。",
    "Email not confirmed":
      "メールアドレスの確認が完了していません。確認メールのリンクを開くか、再送してください。",
    "User already registered": "このメールアドレスはすでに登録されています。",
    "Signup requires a valid password":
      "パスワードは6文字以上で入力してください。",
    "email rate limit exceeded":
      "確認メールの送信上限に達しました。1時間ほど待ってから再試行するか、Googleログインをご利用ください。",
  };

  return translations[message] ?? message;
}

function isDuplicateSignup(
  user: { identities?: unknown } | null | undefined
): boolean {
  return (
    Boolean(user) &&
    Array.isArray(user?.identities) &&
    user.identities.length === 0
  );
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
  const emailRedirectTo = getEmailRedirectUrl("/onboarding");

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

  if (isDuplicateSignup(data.user)) {
    return {
      error:
        "このメールアドレスはすでに登録されています。ログインするか、確認メールを再送してください。",
      email: trimmedEmail,
      canResend: true,
    };
  }

  if (data.user && !data.session) {
    return {
      needsConfirmation: true,
      email: trimmedEmail,
      message:
        "確認メールを送信しました。届かない場合は迷惑メールフォルダを確認するか、下の「確認メールを再送」をお試しください。",
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

export async function resendConfirmationEmailAction(email: string) {
  const supabase = await createClient();
  const trimmedEmail = email.trim();
  const emailRedirectTo = getEmailRedirectUrl("/onboarding");

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: trimmedEmail,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  return {
    message:
      "確認メールを再送しました。迷惑メールフォルダもご確認ください。",
  };
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
