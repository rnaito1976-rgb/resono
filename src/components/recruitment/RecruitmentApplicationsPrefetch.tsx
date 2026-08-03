"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { getMyRecruitmentApplicationsBatchAction } from "@/lib/actions/recruitment";
import {
  collectRecruitmentTargetIds,
  mergeRecruitmentAppliedCache,
} from "@/lib/recruitment/cache";
import { queryKeys } from "@/lib/query/keys";
import type { Member } from "@/types/member";

type RecruitmentApplicationsPrefetchProps = {
  members: Member[];
  viewerMemberId?: string;
};

export function RecruitmentApplicationsPrefetch({
  members,
  viewerMemberId,
}: RecruitmentApplicationsPrefetchProps) {
  const queryClient = useQueryClient();
  const fetchedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!viewerMemberId) {
      return;
    }

    const targetIds = collectRecruitmentTargetIds(members, viewerMemberId).filter(
      (id) => !fetchedIdsRef.current.has(id)
    );

    if (targetIds.length === 0) {
      return;
    }

    for (const id of targetIds) {
      fetchedIdsRef.current.add(id);
    }

    void getMyRecruitmentApplicationsBatchAction(targetIds).then((result) => {
      mergeRecruitmentAppliedCache(queryClient, result.appliedByTarget);

      for (const id of targetIds) {
        if (result.appliedByTarget[id] === undefined) {
          queryClient.setQueryData(queryKeys.recruitment.applied(id), []);
        }
      }
    });
  }, [members, queryClient, viewerMemberId]);

  return null;
}
