"use client";

import Link from "next/link";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import {
  resendConfirmationEmailAction,
  signInWithEmailAction,
  signUpWithEmailAction,
} from "@/lib/actions/auth";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { buildWelcomeOnboardingHref } from "@/lib/navigation/onboarding";
import { AuthFadeIn } from "@/components/auth/AuthMotion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseConfigError } from "@/lib/supabase/config";
import { normalizeEmailInput, validateEmailForAuth } from "@/lib/auth/email";
import { BRAND_DESCRIPTION } from "@/lib/branding/copy";

const RESEND_COOLDOWN_MS = 60_000;

type AuthFormProps = {
  mode: "signup" | "login";
  initialError?: string | null;
  nextPath?: string;
};

function isEmailRateLimitMessage(message: string): boolean {
  return message.includes("送信上限");
}

export function AuthForm({
  mode,
  initialError,
  nextPath = "/",
}: AuthFormProps) {
  const isSignup = mode === "signup";
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const [isPending, startTransition] = useTransition();

  const rateLimited = error ? isEmailRateLimitMessage(error) : false;
  const canResend =
    Boolean(pendingEmail) &&
    !rateLimited &&
    !isPending &&
    (resendAvailableAt === null || Date.now() >= resendAvailableAt);

  useEffect(() => {
    if (resendAvailableAt === null) {
      setResendSecondsLeft(0);
      return;
    }

    const availableAt = resendAvailableAt;

    function tick() {
      const remaining = Math.max(0, Math.ceil((availableAt - Date.now()) / 1000));
      setResendSecondsLeft(remaining);
    }

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [resendAvailableAt]);

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
    const email = normalizeEmailInput(String(formData.get("email") ?? ""));
    const password = String(formData.get("password") ?? "");

    const emailError = validateEmailForAuth(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    if (!password) {
      setError("メールアドレスとパスワードを入力してください");
      return;
    }

    startTransition(async () => {
      if (isSignup) {
        const result = await signUpWithEmailAction(email, password);

        if (result?.error) {
          setError(result.error);
          if (result.canResend && result.email && !isEmailRateLimitMessage(result.error)) {
            setPendingEmail(result.email);
          }
          return;
        }

        if (result?.needsConfirmation) {
          setPendingEmail(result.email ?? email);
          setResendAvailableAt(Date.now() + RESEND_COOLDOWN_MS);
          if (result.message) {
            setMessage(result.message);
          }
        }

        return;
      }

      const result = await signInWithEmailAction(email, password, nextPath);

      if (result?.error) {
        setError(result.error);
        if (result.error.includes("確認") && !isEmailRateLimitMessage(result.error)) {
          setPendingEmail(email);
        }
      }
    });
  }

  function handleResend() {
    if (!canResend || !pendingEmail) {
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

      setResendAvailableAt(Date.now() + RESEND_COOLDOWN_MS);

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
          {isSignup ? BRAND_DESCRIPTION : "おかえりなさい。あなたの frequency を見つけに。"}
        </p>
      </div>

      <GoogleAuthButton
        label={isSignup ? "Googleで始める" : "Googleでログイン"}
        nextPath={isSignup ? buildWelcomeOnboardingHref() : nextPath}
        skipPhoto={isSignup || nextPath.includes("skipPhoto=1")}
      />

      {rateLimited ? (
        <p className="rounded-2xl border border-border bg-white/[0.03] px-4 py-4 text-[13px] leading-relaxed text-white/60">
          確認メールの送信回数に上限があります。すぐに始める場合は Google ログインをご利用ください。
        </p>
      ) : null}

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] uppercase tracking-[0.18em] text-white/35">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
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

        {pendingEmail && !rateLimited ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend}
              className="text-[13px] text-primary transition-opacity disabled:opacity-50"
            >
              {canResend
                ? "確認メールを再送する"
                : `確認メールを再送する（${resendSecondsLeft}秒後）`}
            </button>
            <p className="text-[12px] leading-relaxed text-white/40">
              再送は1分に1回までです。届かない場合は迷惑メールフォルダもご確認ください。
            </p>
          </div>
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
          href={isSignup ? "/login" : "/welcome"}
          className="mt-2 inline-block text-[15px] font-medium text-primary"
        >
          {isSignup ? "ログイン" : "新規登録"}
        </Link>
      </div>
    </AuthFadeIn>
  );
}
