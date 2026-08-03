import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { RecruitmentPartApplicants } from "@/lib/recruitment/applications";

export function seedRecruitmentAppliedCache(
  queryClient: QueryClient,
  appliedByTarget: Record<string, string[]>
) {
  for (const [targetMemberId, appliedParts] of Object.entries(appliedByTarget)) {
    queryClient.setQueryData(
      queryKeys.recruitment.applied(targetMemberId),
      appliedParts
    );
  }
}

export function seedRecruitmentApplicantsCache(
  queryClient: QueryClient,
  targetMemberId: string,
  parts: RecruitmentPartApplicants[]
) {
  queryClient.setQueryData(queryKeys.recruitment.applicants(targetMemberId), parts);
}

export function mergeRecruitmentAppliedCache(
  queryClient: QueryClient,
  appliedByTarget: Record<string, string[]>
) {
  for (const [targetMemberId, appliedParts] of Object.entries(appliedByTarget)) {
    const key = queryKeys.recruitment.applied(targetMemberId);
    if (queryClient.getQueryData<string[]>(key) !== undefined) {
      continue;
    }

    queryClient.setQueryData(key, appliedParts);
  }
}

export function collectRecruitmentTargetIds(
  members: Array<{ id: string; lookingFor?: { parts?: string[] } }>,
  excludeMemberId?: string
): string[] {
  const ids = new Set<string>();

  for (const member of members) {
    if (excludeMemberId && member.id === excludeMemberId) {
      continue;
    }

    const parts = member.lookingFor?.parts;
    if (Array.isArray(parts) && parts.some(Boolean)) {
      ids.add(member.id);
    }
  }

  return [...ids];
}
