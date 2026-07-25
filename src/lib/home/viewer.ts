import { cache } from "react";
import { DEFAULT_FREQUENCY_COLOR } from "@/lib/frequency-color/palette";
import { getFrequencyColorByUserId } from "@/lib/frequency-color/server";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { getMemberByUserId } from "@/lib/members";
import { getMemberOnboardingState } from "@/lib/members/onboarding-state";
import { getAuthSession } from "@/lib/supabase/auth";
import type { Member } from "@/types/member";

export type HomeViewer = {
  user: Awaited<ReturnType<typeof getAuthSession>>;
  member: Member | undefined;
  frequencyColor: FrequencyColorHex;
  needsOnboarding: boolean;
};

export const getHomeViewer = cache(async (): Promise<HomeViewer> => {
  const user = await getAuthSession();

  if (!user) {
    return {
      user: null,
      member: undefined,
      frequencyColor: DEFAULT_FREQUENCY_COLOR,
      needsOnboarding: false,
    };
  }

  const [member, onboarding, frequencyColorFromProfile] = await Promise.all([
    getMemberByUserId(user.id, { columns: "list" }),
    getMemberOnboardingState(user.id),
    getFrequencyColorByUserId(user.id),
  ]);

  const frequencyColor: FrequencyColorHex =
    (member?.frequencyColor as FrequencyColorHex | undefined) ??
    frequencyColorFromProfile ??
    DEFAULT_FREQUENCY_COLOR;

  return {
    user,
    member,
    frequencyColor,
    needsOnboarding: Boolean(member && !onboarding.complete),
  };
});
