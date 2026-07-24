import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/env";

export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    return null;
  }

  return createSupabaseClient(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
