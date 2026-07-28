"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useAuthUserContext } from "@/providers/AuthUserProvider";

/** SSR seed or layout AuthUserProvider で初回 getUser を省略 */
export function useAuthUser(initialUser: User | null = null) {
  const contextUser = useAuthUserContext();
  const seededUser = contextUser !== undefined ? contextUser : initialUser;
  const hasSeed = contextUser !== undefined || initialUser !== null;
  const [user, setUser] = useState<User | null>(seededUser);
  const [isLoading, setIsLoading] = useState(!hasSeed);

  useEffect(() => {
    const supabase = createClient();

    if (seededUser === null && contextUser === undefined) {
      async function syncUser() {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        setUser(currentUser);
        setIsLoading(false);
      }

      void syncUser();
    } else {
      setIsLoading(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [contextUser, seededUser]);

  return {
    user,
    isLoading,
    isLoggedIn: Boolean(user ?? seededUser),
  };
}
