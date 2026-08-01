"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchMemberProfile } from "@/lib/profile/prefetch";

const ProfileBottomSheet = dynamic(
  () =>
    import("@/components/profile/ProfileBottomSheet").then((module) => ({
      default: module.ProfileBottomSheet,
    })),
  { ssr: false }
);

type ProfileSheetContextValue = {
  openProfile: (memberId: string) => void;
  closeProfile: () => void;
};

const ProfileSheetContext = createContext<ProfileSheetContextValue | null>(null);

export function ProfileSheetProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [memberId, setMemberId] = useState<string | null>(null);

  const openProfile = useCallback(
    (id: string) => {
      void prefetchMemberProfile(queryClient, id);
      setMemberId(id);
    },
    [queryClient]
  );

  const closeProfile = useCallback(() => {
    setMemberId(null);
  }, []);

  const value = useMemo(
    () => ({ openProfile, closeProfile }),
    [openProfile, closeProfile]
  );

  return (
    <ProfileSheetContext.Provider value={value}>
      {children}
      {memberId ? (
        <ProfileBottomSheet memberId={memberId} onClose={closeProfile} />
      ) : null}
    </ProfileSheetContext.Provider>
  );
}

export function useProfileSheet() {
  const context = useContext(ProfileSheetContext);
  if (!context) {
    throw new Error("useProfileSheet must be used within ProfileSheetProvider");
  }

  return context;
}

/** Provider外（Welcome等）では null を返し Link フォールバック */
export function useProfileSheetOptional() {
  return useContext(ProfileSheetContext);
}
