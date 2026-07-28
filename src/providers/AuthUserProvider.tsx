"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

const AuthUserContext = createContext<User | null | undefined>(undefined);

export function AuthUserProvider({
  initialUser,
  children,
}: {
  initialUser: User | null;
  children: ReactNode;
}) {
  return (
    <AuthUserContext.Provider value={initialUser}>
      {children}
    </AuthUserContext.Provider>
  );
}

export function useAuthUserContext() {
  return useContext(AuthUserContext);
}
