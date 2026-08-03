import type { QueryClient } from "@tanstack/react-query";
import { getMemberProfileAction } from "@/lib/actions/profile";
import { queryKeys } from "@/lib/query/keys";
import {
  buildMemberProfileSeed,
  type ProfileSheetSeed,
} from "@/lib/profile/sheet-seed";

export function seedMemberProfileCache(
  queryClient: QueryClient,
  memberId: string,
  seed: ProfileSheetSeed
) {
  queryClient.setQueryData(queryKeys.members.profile(memberId), buildMemberProfileSeed(seed));
}

export function prefetchMemberProfile(
  queryClient: QueryClient,
  memberId: string,
  options?: { light?: boolean }
) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.members.profile(memberId),
    queryFn: async () => {
      const result = await getMemberProfileAction(memberId, {
        light: options?.light,
      });
      if (result.error || !result.data) {
        throw new Error(result.error ?? "profile_not_found");
      }

      return result.data;
    },
    staleTime: 60 * 1000,
  });
}
