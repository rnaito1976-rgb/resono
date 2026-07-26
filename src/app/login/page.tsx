import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { formatAuthFailureReason } from "@/lib/auth/errors";
import { buildWelcomeOnboardingHref } from "@/lib/navigation/onboarding";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; reason?: string; next?: string; from?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, reason, next, from } = await searchParams;
  const initialError =
    error === "auth" ? formatAuthFailureReason(reason) : null;
  const nextPath = next ?? (from === "welcome" ? buildWelcomeOnboardingHref() : "/");

  return (
    <AuthShell backHref="/welcome">
      <AuthForm mode="login" initialError={initialError} nextPath={nextPath} />
    </AuthShell>
  );
}
