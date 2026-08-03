"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { startResonoFromWelcomeAction, needsProfileRegistrationAction } from "@/lib/actions/onboarding";
import { readValidWelcomeOnboardingAnswers } from "@/lib/welcome/onboarding-registration";
import { clearWelcomeOnboardingAnswers } from "@/lib/welcome/onboarding-storage";
import { createClient } from "@/lib/supabase/client";

const WELCOME_SIGNUP_INTENT_KEY = "resono:welcome-signup-intent";

export function markWelcomeSignupIntent() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(WELCOME_SIGNUP_INTENT_KEY, "1");
}

export function WelcomeRegistrationGate() {
  const router = useRouter();
  const runningRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function completeWelcomeRegistration() {
      if (runningRef.current) {
        return;
      }

      runningRef.current = true;

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (cancelled || !user) {
          return;
        }

        const needsRegistration = await needsProfileRegistrationAction();
        if (!needsRegistration) {
          sessionStorage.removeItem(WELCOME_SIGNUP_INTENT_KEY);
          return;
        }

        const signupIntent = sessionStorage.getItem(WELCOME_SIGNUP_INTENT_KEY) === "1";
        const answers = readValidWelcomeOnboardingAnswers();

        if (!answers) {
          if (signupIntent) {
            sessionStorage.removeItem(WELCOME_SIGNUP_INTENT_KEY);
            router.replace("/welcome");
          }
          return;
        }

        const result = await startResonoFromWelcomeAction(answers);
        if (cancelled) {
          return;
        }

        if ("error" in result && result.error) {
          console.error("[WelcomeRegistrationGate]", result.error);
          return;
        }

        clearWelcomeOnboardingAnswers();
        sessionStorage.removeItem(WELCOME_SIGNUP_INTENT_KEY);
        router.replace("redirectTo" in result && result.redirectTo ? result.redirectTo : "/");
        router.refresh();
      } finally {
        runningRef.current = false;
      }
    }

    void completeWelcomeRegistration();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        void completeWelcomeRegistration();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
