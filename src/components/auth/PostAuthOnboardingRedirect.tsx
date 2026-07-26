"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { WELCOME_ONBOARDING_HREF } from "@/lib/navigation/onboarding";

const WELCOME_SIGNUP_INTENT_KEY = "resono:welcome-signup-intent";

export function markWelcomeSignupIntent() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(WELCOME_SIGNUP_INTENT_KEY, "1");
}

export function PostAuthOnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (sessionStorage.getItem(WELCOME_SIGNUP_INTENT_KEY) !== "1") {
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    async function redirectAfterAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled || !session?.user) {
        return;
      }

      sessionStorage.removeItem(WELCOME_SIGNUP_INTENT_KEY);
      router.replace(WELCOME_ONBOARDING_HREF);
    }

    void redirectAfterAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        sessionStorage.removeItem(WELCOME_SIGNUP_INTENT_KEY);
        router.replace(WELCOME_ONBOARDING_HREF);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
