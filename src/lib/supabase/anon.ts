import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export function createAnonClient() {
  return createSupabaseClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
}
