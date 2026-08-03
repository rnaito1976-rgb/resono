"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  getMyRecruitmentApplicationsAction,
  toggleRecruitmentApplicationAction,
} from "@/lib/actions/recruitment";
import { normalizeRecruitmentPart } from "@/lib/recruitment/part";
import { queryKeys } from "@/lib/query/keys";

const RECRUITMENT_STALE_MS = 5 * 60 * 1000;

function toggleAppliedPart(current: string[], part: string, applied: boolean): string[] {
  const normalized = normalizeRecruitmentPart(part);

  if (applied) {
    if (current.some((item) => normalizeRecruitmentPart(item) === normalized)) {
      return current;
    }

    return [...current, part];
  }

  return current.filter((item) => normalizeRecruitmentPart(item) !== normalized);
}

export function useRecruitmentApplications(
  targetMemberId: string,
  initialAppliedParts: string[] = []
) {
  const queryClient = useQueryClient();
  const [pendingParts, setPendingParts] = useState<Set<string>>(() => new Set());
  const queryKey = queryKeys.recruitment.applied(targetMemberId);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await getMyRecruitmentApplicationsAction(targetMemberId);
      return result.appliedParts;
    },
    initialData: () =>
      queryClient.getQueryData<string[]>(queryKey) ??
      (initialAppliedParts.length > 0 ? initialAppliedParts : undefined),
    staleTime: RECRUITMENT_STALE_MS,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const toggle = useCallback(
    (part: string) => {
      const normalized = normalizeRecruitmentPart(part);
      if (pendingParts.has(normalized)) {
        return Promise.resolve(undefined);
      }

      setPendingParts((current) => new Set(current).add(normalized));
      void queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<string[]>(queryKey) ?? query.data ?? [];
      const optimisticApplied = !previous.some(
        (item) => normalizeRecruitmentPart(item) === normalized
      );
      const optimistic = toggleAppliedPart(previous, part, optimisticApplied);

      queryClient.setQueryData(queryKey, optimistic);

      return toggleRecruitmentApplicationAction({ targetMemberId, part })
        .then((result) => {
          if ("error" in result && result.error) {
            queryClient.setQueryData(queryKey, previous);
            return result;
          }

          if ("applied" in result && result.part) {
            queryClient.setQueryData(queryKey, (current: string[] = []) =>
              toggleAppliedPart(current, result.part, result.applied)
            );
          }

          return result;
        })
        .finally(() => {
          setPendingParts((current) => {
            const next = new Set(current);
            next.delete(normalized);
            return next;
          });
        });
    },
    [pendingParts, query.data, queryClient, queryKey, targetMemberId]
  );

  return {
    appliedParts: query.data ?? [],
    toggle,
    pendingParts,
    isReady: query.data !== undefined,
  };
}
