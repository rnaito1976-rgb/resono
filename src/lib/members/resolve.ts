import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getAuthSession } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const resolveCurrentMemberId = cache(async function resolveCurrentMemberId(): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const user = await getAuthSession();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select("id")
    .or(`user_id.eq.${user.id},id.eq.${user.id}`)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[Supabase] resolveCurrentMemberId:", error.message);
  }

  return data?.id ?? null;
});
