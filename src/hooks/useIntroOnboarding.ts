"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeIntroOnboardingAction } from "@/lib/actions/intro-onboarding";
import {
  INTRO_ONBOARDING_STEPS,
  INTRO_ONBOARDING_PENDING_EVENT,
  clearIntroOnboardingSessionPending,
  readIntroOnboardingDismissedLocally,
  readIntroOnboardingSessionPending,
  writeIntroOnboardingDismissedLocally,
} from "@/lib/onboarding/intro-onboarding";

type UseIntroOnboardingOptions = {
  initialVisible: boolean;
  userId: string | null;
  previewMode?: boolean;
};

export function useIntroOnboarding({
  initialVisible,
  userId,
  previewMode = false,
}: UseIntroOnboardingOptions) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [sessionPending, setSessionPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const localDismissed = useMemo(
    () => (userId ? readIntroOnboardingDismissedLocally(userId) : false),
    [userId]
  );

  useEffect(() => {
    if (previewMode) {
      return;
    }

    if (readIntroOnboardingSessionPending()) {
      setSessionPending(true);
    }

    function handlePending() {
      setSessionPending(true);
    }

    window.addEventListener(INTRO_ONBOARDING_PENDING_EVENT, handlePending);
    return () => {
      window.removeEventListener(INTRO_ONBOARDING_PENDING_EVENT, handlePending);
    };
  }, [previewMode]);

  const visible = previewMode
    ? !dismissed
    : (initialVisible || sessionPending) && !dismissed && !localDismissed;

  const steps = useMemo(() => INTRO_ONBOARDING_STEPS, []);

  const dismiss = useCallback(() => {
    if (previewMode) {
      setDismissed(true);
      router.replace("/", { scroll: false });
      return;
    }

    clearIntroOnboardingSessionPending();
    setSessionPending(false);

    if (userId) {
      writeIntroOnboardingDismissedLocally(userId);
    }

    setDismissed(true);
    setError(null);

    startTransition(async () => {
      const result = await completeIntroOnboardingAction();
      if (result.error) {
        setError(result.error);
        setDismissed(false);
        return;
      }

      if (result.userId) {
        writeIntroOnboardingDismissedLocally(result.userId);
      }

      router.refresh();
    });
  }, [previewMode, router, userId]);

  return {
    visible,
    steps,
    dismiss,
    isPending: previewMode ? false : isPending,
    error,
  };
}
