import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";

export default function SignUpPage() {
  return (
    <AuthShell backHref="/welcome">
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
