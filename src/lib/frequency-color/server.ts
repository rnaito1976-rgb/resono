import {
  DEFAULT_FREQUENCY_COLOR,
  isValidFrequencyColor,
} from "@/lib/frequency-color/palette";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { createAnonClient } from "@/lib/supabase/anon";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function getFrequencyColorByUserId(
  userId: string
): Promise<FrequencyColorHex | undefined> {
  if (!isSupabaseConfigured()) {
    return undefined;
  }

  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("frequency_color")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[Supabase] getFrequencyColorByUserId:", error.message);
      return undefined;
    }

    const color = data?.frequency_color;
    return color && isValidFrequencyColor(color) ? color : undefined;
  } catch (error) {
    console.error("[Supabase] getFrequencyColorByUserId:", error);
    return undefined;
  }
}

export async function getFrequencyColorsByUserIds(
  userIds: string[]
): Promise<Map<string, FrequencyColorHex>> {
  const map = new Map<string, FrequencyColorHex>();

  if (!isSupabaseConfigured() || userIds.length === 0) {
    return map;
  }

  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, frequency_color")
      .in("user_id", userIds);

    if (error) {
      console.error("[Supabase] getFrequencyColorsByUserIds:", error.message);
      return map;
    }

    for (const row of data ?? []) {
      if (row.frequency_color && isValidFrequencyColor(row.frequency_color)) {
        map.set(row.user_id, row.frequency_color);
      }
    }
  } catch (error) {
    console.error("[Supabase] getFrequencyColorsByUserIds:", error);
  }

  return map;
}

export async function saveFrequencyColorForUser(
  userId: string,
  color: FrequencyColorHex
): Promise<{ success: boolean; error?: string }> {
  if (!isValidFrequencyColor(color)) {
    return { success: false, error: "無効なカラーです" };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabaseが設定されていません。.env.local を確認してください。",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: userId,
        frequency_color: color,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("[Supabase] saveFrequencyColorForUser:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Supabase] saveFrequencyColorForUser:", error);
    return { success: false, error: "保存に失敗しました" };
  }
}

export async function getViewerFrequencyColor(): Promise<FrequencyColorHex> {
  if (!isSupabaseConfigured()) {
    return DEFAULT_FREQUENCY_COLOR;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return DEFAULT_FREQUENCY_COLOR;
    }

    const color = await getFrequencyColorByUserId(user.id);
    return color ?? DEFAULT_FREQUENCY_COLOR;
  } catch {
    return DEFAULT_FREQUENCY_COLOR;
  }
}
