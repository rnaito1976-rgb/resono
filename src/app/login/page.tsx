import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; reason?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, reason, next } = await searchParams;
  const initialError =
    error === "auth"
      ? reason
        ? `ログインに失敗しました: ${reason}`
        : "ログインに失敗しました。もう一度お試しください。"
      : null;

  return (
    <AuthShell backHref="/welcome">
      <AuthForm mode="login" initialError={initialError} nextPath={next ?? "/"} />
    </AuthShell>
  );
}
