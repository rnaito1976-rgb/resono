"use client";

import { useCallback, useMemo, useState } from "react";
import {
  readIntroOnboardingDismissedLocally,
  writeIntroOnboardingDismissedLocally,
} from "@/lib/onboarding/intro-onboarding";

export function useIntroOnboarding(userId: string) {
  const [dismissed, setDismissed] = useState(false);

  const localDismissed = useMemo(
    () => readIntroOnboardingDismissedLocally(userId),
    [userId]
  );

  const visible = !dismissed && !localDismissed;

  const dismiss = useCallback(() => {
    writeIntroOnboardingDismissedLocally(userId);
    setDismissed(true);
  }, [userId]);

  return {
    visible,
    dismiss,
  };
}
