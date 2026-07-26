import { cache } from "react";
import { getFrequencyColorByUserId } from "@/lib/frequency-color/server";
import { resolveCurrentMemberId } from "@/lib/members/resolve";
import { createAnonClient } from "@/lib/supabase/anon";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type OnboardingState = {
  complete: boolean;
};

/** Lightweight onboarding gate (portrait flag + frequency color only). */
export const getMemberOnboardingState = cache(
  async (userId: string, memberId?: string): Promise<OnboardingState> => {
    if (!isSupabaseConfigured()) {
      return { complete: false };
    }

    const resolvedMemberId = memberId ?? (await resolveCurrentMemberId());
    if (!resolvedMemberId) {
      return { complete: false };
    }

    const supabase = createAnonClient();
    const [{ data: memberRow }, frequencyColor] = await Promise.all([
      supabase.from("members").select("portrait").eq("id", resolvedMemberId).maybeSingle(),
      getFrequencyColorByUserId(userId),
    ]);

    const portrait = memberRow?.portrait as { dialogueCompleted?: boolean } | null;
    const dialogueCompleted = portrait?.dialogueCompleted === true;

    return {
      complete: dialogueCompleted && Boolean(frequencyColor),
    };
  }
);
