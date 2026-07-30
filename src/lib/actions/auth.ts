"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolvePostAuthRedirect } from "@/lib/auth/post-auth-redirect";
import { ensureMemberForUser } from "@/lib/members";
import { buildWelcomeOnboardingHref } from "@/lib/navigation/onboarding";
import { createClient } from "@/lib/supabase/server";
import { getEmailRedirectUrl } from "@/lib/supabase/env";
import {
  normalizeEmailInput,
  translateAuthError,
  validateEmailForAuth,
} from "@/lib/auth/email";

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
  const trimmedEmail = normalizeEmailInput(email);
  const emailError = validateEmailForAuth(trimmedEmail);

  if (emailError) {
    return { error: emailError };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });

  if (error) {
    console.error("[Auth] signIn:", error.code, error.message);
    return { error: translateAuthError(error) };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureMemberForUser(user.id, user.email);
  }

  revalidatePath("/", "layout");
  redirect(
    resolvePostAuthRedirect(
      nextPath,
      nextPath?.includes("skipPhoto=1")
    )
  );
}

export async function signUpWithEmailAction(email: string, password: string) {
  const trimmedEmail = normalizeEmailInput(email);
  const emailError = validateEmailForAuth(trimmedEmail);

  if (emailError) {
    return { error: emailError };
  }

  const supabase = await createClient();
  const emailRedirectTo = getEmailRedirectUrl();

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    console.error("[Auth] signUp:", error.code, error.message);
    return { error: translateAuthError(error) };
  }

  if (isDuplicateSignup(data.user)) {
    return {
      error:
        "このメールアドレスはすでに登録されています。ログインページからお試しください。",
      email: trimmedEmail,
      canResend: false,
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
  redirect(buildWelcomeOnboardingHref());
}

export async function resendConfirmationEmailAction(email: string) {
  const trimmedEmail = normalizeEmailInput(email);
  const emailError = validateEmailForAuth(trimmedEmail);

  if (emailError) {
    return { error: emailError };
  }

  const supabase = await createClient();
  const emailRedirectTo = getEmailRedirectUrl();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: trimmedEmail,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    console.error("[Auth] resend:", error.code, error.message);
    return { error: translateAuthError(error) };
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
  redirect("/");
}
