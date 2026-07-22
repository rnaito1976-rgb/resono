import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

let client: SupabaseClient<Database> | undefined;

export function createClient() {
  if (!client) {
    client = createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
  }

  return client;
}
