"use client";

import { Button } from "@/components/ui/button";

import { buildWelcomeOnboardingHref } from "@/lib/navigation/onboarding";

type WelcomeStartResonoButtonProps = {
  className?: string;
};

export function WelcomeStartResonoButton({
  className = "h-12 w-full rounded-full text-[15px]",
}: WelcomeStartResonoButtonProps) {
  function handleClick() {
    window.location.href = buildWelcomeOnboardingHref();
  }

  return (
    <Button
      type="button"
      size="lg"
      className={className}
      onClick={handleClick}
    >
      RESONOをはじめる
    </Button>
  );
}
