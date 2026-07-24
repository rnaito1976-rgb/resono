"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  resendConfirmationEmailAction,
  signInWithEmailAction,
  signUpWithEmailAction,
} from "@/lib/actions/auth";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { AuthFadeIn } from "@/components/auth/AuthMotion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseConfigError } from "@/lib/supabase/config";

type AuthFormProps = {
  mode: "signup" | "login";
  initialError?: string | null;
  nextPath?: string;
};

export function AuthForm({
  mode,
  initialError,
  nextPath = "/",
}: AuthFormProps) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const configError = getSupabaseConfigError();
    if (configError) {
      setError(configError);
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください");
      return;
    }

    startTransition(async () => {
      if (isSignup) {
        const result = await signUpWithEmailAction(email, password);

        if (result?.error) {
          setError(result.error);
          if (result.canResend && result.email) {
            setPendingEmail(result.email);
          }
          return;
        }

        if (result?.needsConfirmation) {
          setPendingEmail(result.email ?? email);
          if (result.message) {
            setMessage(result.message);
          }
        }

        return;
      }

      const result = await signInWithEmailAction(email, password, nextPath);

      if (result?.error) {
        setError(result.error);
        if (result.error.includes("確認")) {
          setPendingEmail(email);
        }
        return;
      }

      if (result?.success) {
        router.push(result.nextPath ?? "/");
        router.refresh();
      }
    });
  }

  function handleResend() {
    if (!pendingEmail || isPending) {
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await resendConfirmationEmailAction(pendingEmail);

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.message) {
        setMessage(result.message);
      }
    });
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
        nextPath={isSignup ? "/onboarding" : nextPath}
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
        {message ? <p className="text-[13px] text-white/70">{message}</p> : null}

        {pendingEmail ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={isPending}
            className="text-[13px] text-primary transition-opacity disabled:opacity-50"
          >
            確認メールを再送する
          </button>
        ) : null}

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
          className="mt-2 inline-block text-[15px] font-medium text-primary"
        >
          {isSignup ? "ログイン" : "新規登録"}
        </Link>
      </div>
    </AuthFadeIn>
  );
}
