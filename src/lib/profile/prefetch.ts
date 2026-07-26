import type { QueryClient } from "@tanstack/react-query";
import { getMemberProfileAction } from "@/lib/actions/profile";
import { queryKeys } from "@/lib/query/keys";

export function prefetchMemberProfile(queryClient: QueryClient, memberId: string) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.members.profile(memberId),
    queryFn: async () => {
      const result = await getMemberProfileAction(memberId);
      if (result.error || !result.data) {
        throw new Error(result.error ?? "profile_not_found");
      }

      return result.data;
    },
    staleTime: 60 * 1000,
  });
}
