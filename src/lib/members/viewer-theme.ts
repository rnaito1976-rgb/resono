import { cache } from "react";
import { DEFAULT_FREQUENCY_COLOR } from "@/lib/frequency-color/palette";
import { getFrequencyColorByUserId } from "@/lib/frequency-color/server";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { getAuthUser } from "@/lib/supabase/auth";

/** Layout-only: theme color without loading full member profile. */
export const getViewerTheme = cache(async (): Promise<FrequencyColorHex> => {
  const user = await getAuthUser();
  if (!user) {
    return DEFAULT_FREQUENCY_COLOR;
  }

  const color = await getFrequencyColorByUserId(user.id);
  return color ?? DEFAULT_FREQUENCY_COLOR;
});
