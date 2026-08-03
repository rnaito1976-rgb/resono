"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { startResonoFromWelcomeAction } from "@/lib/actions/onboarding";
import { readValidWelcomeOnboardingAnswers } from "@/lib/welcome/onboarding-registration";
import { clearWelcomeOnboardingAnswers } from "@/lib/welcome/onboarding-storage";

type WelcomeStartResonoButtonProps = {
  className?: string;
};

export function WelcomeStartResonoButton({
  className = "h-12 w-full rounded-full text-[15px]",
}: WelcomeStartResonoButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);

    const answers = readValidWelcomeOnboardingAnswers();
    if (!answers) {
      router.push("/welcome");
      return;
    }

    startTransition(async () => {
      const result = await startResonoFromWelcomeAction(answers);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }

      clearWelcomeOnboardingAnswers();
      router.replace("redirectTo" in result && result.redirectTo ? result.redirectTo : "/");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        size="lg"
        className={className}
        disabled={isPending}
        onClick={handleClick}
      >
        {isPending ? "準備中..." : "RESONOをはじめる"}
      </Button>
      {error ? <p className="text-center text-[13px] text-red-300">{error}</p> : null}
    </div>
  );
}
