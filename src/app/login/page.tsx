import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { formatAuthFailureReason } from "@/lib/auth/errors";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; reason?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, reason, next } = await searchParams;
  const initialError =
    error === "auth" ? formatAuthFailureReason(reason) : null;

  return (
    <AuthShell backHref="/welcome">
      <AuthForm mode="login" initialError={initialError} nextPath={next ?? "/"} />
    </AuthShell>
  );
}
