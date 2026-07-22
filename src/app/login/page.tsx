import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const initialError =
    error === "auth" ? "ログインに失敗しました。もう一度お試しください。" : null;

  return (
    <AuthShell backHref="/welcome">
      <AuthForm mode="login" initialError={initialError} />
    </AuthShell>
  );
}
