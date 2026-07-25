import type { User } from "@supabase/supabase-js";
import { cache } from "react";
import {
  DEFAULT_FREQUENCY_COLOR,
} from "@/lib/frequency-color/palette";
import { getFrequencyColorByUserId } from "@/lib/frequency-color/server";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { getMemberByUserId } from "@/lib/members";
import { getAuthUser } from "@/lib/supabase/auth";
import type { Member } from "@/types/member";

export type ViewerContext = {
  user: User | null;
  member: Member | undefined;
  frequencyColor: FrequencyColorHex;
};

/** Single cached viewer load for layout + home (auth, member, theme color). */
export const getViewerContext = cache(async (): Promise<ViewerContext> => {
  const user = await getAuthUser();

  if (!user) {
    return {
      user: null,
      member: undefined,
      frequencyColor: DEFAULT_FREQUENCY_COLOR,
    };
  }

  const [member, frequencyColorFromProfile] = await Promise.all([
    getMemberByUserId(user.id, { columns: "list" }),
    getFrequencyColorByUserId(user.id),
  ]);
  const frequencyColor: FrequencyColorHex =
    (member?.frequencyColor as FrequencyColorHex | undefined) ??
    frequencyColorFromProfile ??
    DEFAULT_FREQUENCY_COLOR;

  return { user, member, frequencyColor };
});
