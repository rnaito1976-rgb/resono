"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMemberProfileAction } from "@/lib/actions/profile";
import { buildMemberProfileSeed, type ProfileSheetSeed } from "@/lib/profile/sheet-seed";
import { queryKeys } from "@/lib/query/keys";

type UseMemberProfileOptions = {
  light?: boolean;
  seed?: ProfileSheetSeed;
};

/** TanStack Query: profile detail cache (Bottom Sheet / revisit). */
export function useMemberProfile(
  memberId: string | null,
  options?: UseMemberProfileOptions
) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.members.profile(memberId ?? "");
  const seedPayload = options?.seed ? buildMemberProfileSeed(options.seed) : undefined;

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!memberId) {
        throw new Error("memberId is required");
      }

      const result = await getMemberProfileAction(memberId, {
        light: options?.light,
      });
      if (result.error || !result.data) {
        throw new Error(result.error ?? "profile_not_found");
      }

      return result.data;
    },
    enabled: Boolean(memberId),
    placeholderData: () =>
      queryClient.getQueryData(queryKey) ?? seedPayload,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
