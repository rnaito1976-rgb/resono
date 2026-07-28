import { cache } from "react";
import { DEFAULT_FREQUENCY_COLOR } from "@/lib/frequency-color/palette";
import { getFrequencyColorByUserId } from "@/lib/frequency-color/server";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { ensureMemberForUser, getMemberByUserId } from "@/lib/members";
import { getAuthSession } from "@/lib/supabase/auth";
import type { Member } from "@/types/member";

export type HomeViewer = {
  user: Awaited<ReturnType<typeof getAuthSession>>;
  member: Member | undefined;
  frequencyColor: FrequencyColorHex;
};

export const getHomeViewer = cache(async (): Promise<HomeViewer> => {
  const user = await getAuthSession();

  if (!user) {
    return {
      user: null,
      member: undefined,
      frequencyColor: DEFAULT_FREQUENCY_COLOR,
    };
  }

  let member = await getMemberByUserId(user.id, { columns: "list" });
  if (!member) {
    member = (await ensureMemberForUser(user.id, user.email)) ?? undefined;
  }

  const frequencyColorFromProfile =
    member?.frequencyColor == null ? await getFrequencyColorByUserId(user.id) : null;
  const frequencyColor: FrequencyColorHex =
    (member?.frequencyColor as FrequencyColorHex | undefined) ??
    frequencyColorFromProfile ??
    DEFAULT_FREQUENCY_COLOR;

  return {
    user,
    member,
    frequencyColor,
  };
});
