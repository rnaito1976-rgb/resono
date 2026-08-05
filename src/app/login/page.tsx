import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { formatAuthFailureReason } from "@/lib/auth/errors";
import { createNoIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createNoIndexMetadata("ログイン");
type LoginPageProps = {
  searchParams: Promise<{ error?: string; reason?: string; next?: string; from?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, reason, next } = await searchParams;
  const initialError =
    error === "auth" ? formatAuthFailureReason(reason) : null;
  const nextPath = next ?? "/";

  return (
    <AuthShell backHref="/welcome">
      <AuthForm mode="login" initialError={initialError} nextPath={nextPath} />
    </AuthShell>
  );
}
