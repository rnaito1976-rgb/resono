"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { initializeMemberProfile } from "@/lib/actions/auth";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { AuthFadeIn } from "@/components/auth/AuthMotion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseConfigError } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "signup" | "login";
  initialError?: string | null;
};

export function AuthForm({ mode, initialError }: AuthFormProps) {
  const isSignup = mode === "signup";
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsPending(true);

    const configError = getSupabaseConfigError();
    if (configError) {
      setError(configError);
      setIsPending(false);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください");
      setIsPending(false);
      return;
    }

    const supabase = createClient();

    if (isSignup) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsPending(false);
        return;
      }

      if (data.user && !data.session) {
        setMessage(
          "確認メールを送信しました。メール内のリンクをクリックしてからログインしてください。"
        );
        setIsPending(false);
        return;
      }

      const profileResult = await initializeMemberProfile();
      if (profileResult?.error) {
        setError(profileResult.error);
        setIsPending(false);
        return;
      }

      window.location.href = "/onboarding";
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsPending(false);
      return;
    }

    if (!data.session) {
      setError("ログインに失敗しました。メール確認が必要な場合があります。");
      setIsPending(false);
      return;
    }

    window.location.href = "/";
  }

  return (
    <AuthFadeIn className="space-y-8">
      <div>
        <h1 className="text-[28px] font-light tracking-tight text-white">
          {isSignup ? "アカウントを作成" : "ログイン"}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-white/50">
          {isSignup
            ? "世界観でつながるミュージシャンのための場所へ。"
            : "おかえりなさい。あなたの frequency を見つけに。"}
        </p>
      </div>

      <GoogleAuthButton
        label={isSignup ? "Googleで始める" : "Googleでログイン"}
        nextPath={isSignup ? "/onboarding" : "/"}
      />

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] uppercase tracking-[0.18em] text-white/35">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-7">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>
        </div>

        {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
        {message ? <p className="text-[13px] text-emerald-300">{message}</p> : null}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "処理中..." : isSignup ? "アカウントを作成" : "ログイン"}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-[14px] text-white/45">
          {isSignup ? "すでにアカウントをお持ちですか？" : "アカウントをお持ちでないですか？"}
        </p>
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="mt-2 inline-block text-[15px] font-medium text-accent"
        >
          {isSignup ? "ログイン" : "新規登録"}
        </Link>
      </div>
    </AuthFadeIn>
  );
}
