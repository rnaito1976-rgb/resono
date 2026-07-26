import type { User } from "@supabase/supabase-js";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** Cookie-based session read, validated against the Auth server. */
const resolveAuthUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export const getAuthSession = resolveAuthUser;

/** Deduplicate Supabase auth validation within a single request. */
export const getAuthUser = resolveAuthUser;
