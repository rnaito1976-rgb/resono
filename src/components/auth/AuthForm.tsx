"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  signInWithEmail,
  signUpWithEmail,
  type AuthState,
} from "@/lib/actions/auth";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { AuthFadeIn } from "@/components/auth/AuthMotion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthFormProps = {
  mode: "signup" | "login";
  initialError?: string | null;
};

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function AuthForm({ mode, initialError }: AuthFormProps) {
  const isSignup = mode === "signup";
  const action = isSignup ? signUpWithEmail : signInWithEmail;
  const [state, formAction] = useActionState<AuthState, FormData>(action, {
    error: initialError ?? undefined,
  });

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

      <form action={formAction} className="space-y-8">
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

        {state?.error ? <p className="text-[13px] text-red-300">{state.error}</p> : null}
        {state?.message ? (
          <p className="text-[13px] text-emerald-300">{state.message}</p>
        ) : null}

        <SubmitButton
          label={isSignup ? "アカウントを作成" : "ログイン"}
          pendingLabel="処理中..."
        />
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
