import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

type SignUpPageProps = {
  searchParams: Promise<{ from?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { from } = await searchParams;

  if (from !== "welcome") {
    redirect("/welcome");
  }

  return (
    <AuthShell backHref="/welcome">
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
