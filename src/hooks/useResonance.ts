"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  getResonanceStatusAction,
  toggleResonanceAction,
} from "@/lib/actions/resonance";
import type { ResonanceStatus } from "@/lib/resonance/status";
import { queryKeys } from "@/lib/query/keys";
import { RESONANCE_CHANGE_EVENT } from "@/lib/resonance";

const RESONANCE_STALE_MS = 5 * 60 * 1000;

export function useResonance(
  memberId: string,
  initialStatus?: ResonanceStatus
) {
  const queryClient = useQueryClient();
  const [isToggling, setIsToggling] = useState(false);
  const cachedStatus = queryClient.getQueryData<ResonanceStatus>(
    queryKeys.resonance.status(memberId)
  );
  const seedStatus = cachedStatus ?? initialStatus;

  const query = useQuery({
    queryKey: queryKeys.resonance.status(memberId),
    queryFn: () => getResonanceStatusAction(memberId),
    ...(seedStatus ? { initialData: seedStatus } : {}),
    staleTime: RESONANCE_STALE_MS,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: !seedStatus,
    refetchOnWindowFocus: false,
  });

  const toggle = useCallback(() => {
    setIsToggling(true);
    void toggleResonanceAction(memberId)
      .then((result) => {
        if (result.error) {
          return;
        }

        const next: ResonanceStatus = {
          isResonated: result.isResonated,
          isMutual: result.isMutual,
          conversationId: result.conversationId,
        };

        queryClient.setQueryData(queryKeys.resonance.status(memberId), next);
        window.dispatchEvent(new Event(RESONANCE_CHANGE_EVENT));
      })
      .finally(() => {
        setIsToggling(false);
      });
  }, [memberId, queryClient]);

  const state = query.data ?? {
    isResonated: false,
    isMutual: false,
    conversationId: null,
  };

  return {
    ...state,
    toggle,
    mounted: query.isFetched || seedStatus != null,
    isPending: isToggling,
  };
}
