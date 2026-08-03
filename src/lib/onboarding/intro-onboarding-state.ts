import { cache } from "react";
import { shouldShowIntroOnboarding } from "@/lib/onboarding/intro-onboarding";
import { resolveCurrentMemberId } from "@/lib/members/resolve";
import { getAuthSession } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Member } from "@/types/member";

/** Lightweight gate: intro onboarding flags from portrait JSON. */
export const getIntroOnboardingVisible = cache(async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const user = await getAuthSession();
  if (!user) {
    return false;
  }

  const memberId = await resolveCurrentMemberId();
  if (!memberId) {
    return false;
  }

  const supabase = await createClient();
  const { data: memberRow, error } = await supabase
    .from("members")
    .select("portrait")
    .eq("id", memberId)
    .maybeSingle();

  if (error) {
    console.error("[getIntroOnboardingVisible]", error.message);
    return false;
  }

  const portrait = (memberRow?.portrait ?? {}) as Partial<Member["portrait"]>;

  return shouldShowIntroOnboarding({
    introOnboardingPending: portrait.introOnboardingPending === true,
    introOnboardingCompleted: portrait.introOnboardingCompleted === true,
  });
});
