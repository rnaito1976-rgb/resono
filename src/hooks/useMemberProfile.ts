"use client";

import { useQuery } from "@tanstack/react-query";
import { getMemberProfileAction } from "@/lib/actions/profile";
import { queryKeys } from "@/lib/query/keys";

/** ① TanStack Query: プロフィール詳細をキャッシュ（Bottom Sheet / 再表示向け） */
export function useMemberProfile(memberId: string | null) {
  return useQuery({
    queryKey: queryKeys.members.profile(memberId ?? ""),
    queryFn: async () => {
      if (!memberId) {
        throw new Error("memberId is required");
      }

      const result = await getMemberProfileAction(memberId);
      if (result.error || !result.data) {
        throw new Error(result.error ?? "profile_not_found");
      }

      return result.data;
    },
    enabled: Boolean(memberId),
    staleTime: 60 * 1000,
  });
}
