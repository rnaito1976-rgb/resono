"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

/** ⑪ SSRで initialUser がある場合は初回 getSession をスキップ（二重取得削減） */
export function useAuthUser(initialUser: User | null = null) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(initialUser === null);

  useEffect(() => {
    const supabase = createClient();

    if (initialUser === null) {
      async function syncUser() {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          setIsLoading(false);
          return;
        }

        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        setUser(currentUser);
        setIsLoading(false);
      }

      void syncUser();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [initialUser]);

  return {
    user,
    isLoading,
    isLoggedIn: Boolean(user ?? initialUser),
  };
}
