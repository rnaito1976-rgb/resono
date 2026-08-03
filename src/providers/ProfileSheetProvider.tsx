"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ProfileBottomSheet } from "@/components/profile/ProfileBottomSheet";
import {
  prefetchMemberProfile,
  seedMemberProfileCache,
} from "@/lib/profile/prefetch";
import type { ProfileSheetSeed } from "@/lib/profile/sheet-seed";

type ProfileSheetState = {
  memberId: string;
  seed?: ProfileSheetSeed;
};

type ProfileSheetContextValue = {
  openProfile: (memberId: string, seed?: ProfileSheetSeed) => void;
  closeProfile: () => void;
};

const ProfileSheetContext = createContext<ProfileSheetContextValue | null>(null);

export function ProfileSheetProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [sheet, setSheet] = useState<ProfileSheetState | null>(null);

  const openProfile = useCallback(
    (id: string, seed?: ProfileSheetSeed) => {
      if (seed) {
        seedMemberProfileCache(queryClient, id, seed);
      }

      void prefetchMemberProfile(queryClient, id, { light: true });
      setSheet({ memberId: id, seed });
    },
    [queryClient]
  );

  const closeProfile = useCallback(() => {
    setSheet(null);
  }, []);

  const value = useMemo(
    () => ({ openProfile, closeProfile }),
    [openProfile, closeProfile]
  );

  return (
    <ProfileSheetContext.Provider value={value}>
      {children}
      {sheet ? (
        <ProfileBottomSheet
          memberId={sheet.memberId}
          seed={sheet.seed}
          onClose={closeProfile}
        />
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
