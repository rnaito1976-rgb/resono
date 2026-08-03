"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRecruitmentApplicantsAction } from "@/lib/actions/recruitment";
import type { RecruitmentPartApplicants } from "@/lib/recruitment/applications";
import { queryKeys } from "@/lib/query/keys";

const RECRUITMENT_STALE_MS = 5 * 60 * 1000;

export function useRecruitmentApplicants(
  targetMemberId: string,
  initialApplicants: RecruitmentPartApplicants[] = []
) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.recruitment.applicants(targetMemberId);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await getRecruitmentApplicantsAction(targetMemberId);
      return "parts" in result && result.parts ? result.parts : [];
    },
    initialData: () =>
      queryClient.getQueryData<RecruitmentPartApplicants[]>(queryKey) ??
      (initialApplicants.length > 0 ? initialApplicants : undefined),
    staleTime: RECRUITMENT_STALE_MS,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return {
    applicantGroups: query.data ?? [],
    isReady: query.data !== undefined,
  };
}
