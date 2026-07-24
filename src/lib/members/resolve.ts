import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const resolveCurrentMemberId = cache(async function resolveCurrentMemberId(): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: byUserId, error: byUserIdError } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (byUserIdError) {
    console.error("[Supabase] resolveCurrentMemberId by user_id:", byUserIdError.message);
  }

  if (byUserId?.id) {
    return byUserId.id;
  }

  const { data: byId, error: byIdError } = await supabase
    .from("members")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (byIdError) {
    console.error("[Supabase] resolveCurrentMemberId by id:", byIdError.message);
  }

  return byId?.id ?? null;
});
