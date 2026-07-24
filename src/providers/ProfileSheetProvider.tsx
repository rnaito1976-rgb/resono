"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ProfileBottomSheet } from "@/components/profile/ProfileBottomSheet";

type ProfileSheetContextValue = {
  openProfile: (memberId: string) => void;
  closeProfile: () => void;
};

const ProfileSheetContext = createContext<ProfileSheetContextValue | null>(null);

export function ProfileSheetProvider({ children }: { children: ReactNode }) {
  const [memberId, setMemberId] = useState<string | null>(null);

  const openProfile = useCallback((id: string) => {
    setMemberId(id);
  }, []);

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
      <ProfileBottomSheet memberId={memberId} onClose={closeProfile} />
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
