"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  readMembersViewMode,
  writeMembersViewMode,
  type MembersViewMode,
} from "@/lib/members/view-mode";

type MembersViewContextValue = {
  viewMode: MembersViewMode;
  setViewMode: (mode: MembersViewMode) => void;
};

const MembersViewContext = createContext<MembersViewContextValue | null>(null);

export function MembersViewProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewModeState] = useState<MembersViewMode>("card");

  useEffect(() => {
    const stored = readMembersViewMode();
    if (stored) {
      setViewModeState(stored);
    }
  }, []);

  const setViewMode = (mode: MembersViewMode) => {
    setViewModeState(mode);
    writeMembersViewMode(mode);
  };

  const value = useMemo(
    () => ({
      viewMode,
      setViewMode,
    }),
    [viewMode]
  );

  return (
    <MembersViewContext.Provider value={value}>{children}</MembersViewContext.Provider>
  );
}

export function useMembersViewMode() {
  const context = useContext(MembersViewContext);
  if (!context) {
    throw new Error("useMembersViewMode must be used within MembersViewProvider");
  }

  return context;
}

export function useMembersViewModeOptional() {
  return useContext(MembersViewContext);
}
