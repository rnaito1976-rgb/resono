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
import type { MemberProfilePayload } from "@/lib/actions/profile";

const RESONANCE_STALE_MS = 5 * 60 * 1000;

const EMPTY_STATUS: ResonanceStatus = {
  isResonated: false,
  isMutual: false,
  conversationId: null,
};

function syncProfileResonanceStatus(
  queryClient: ReturnType<typeof useQueryClient>,
  memberId: string,
  status: ResonanceStatus
) {
  queryClient.setQueryData<MemberProfilePayload>(
    queryKeys.members.profile(memberId),
    (current) => (current ? { ...current, resonanceStatus: status } : current)
  );
}

export function useResonance(
  memberId: string,
  initialStatus?: ResonanceStatus
) {
  const queryClient = useQueryClient();
  const [isToggling, setIsToggling] = useState(false);
  const queryKey = queryKeys.resonance.status(memberId);

  const query = useQuery({
    queryKey,
    queryFn: () => getResonanceStatusAction(memberId),
    placeholderData: () =>
      queryClient.getQueryData<ResonanceStatus>(queryKey) ??
      initialStatus ??
      EMPTY_STATUS,
    staleTime: RESONANCE_STALE_MS,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const toggle = useCallback(() => {
    setIsToggling(true);
    void queryClient.cancelQueries({ queryKey });

    const previous =
      queryClient.getQueryData<ResonanceStatus>(queryKey) ??
      query.data ??
      EMPTY_STATUS;

    const optimistic: ResonanceStatus = {
      isResonated: !previous.isResonated,
      isMutual: false,
      conversationId: previous.isResonated ? null : previous.conversationId,
    };

    queryClient.setQueryData(queryKey, optimistic);
    syncProfileResonanceStatus(queryClient, memberId, optimistic);

    void toggleResonanceAction(memberId)
      .then((result) => {
        if (result.error) {
          queryClient.setQueryData(queryKey, previous);
          syncProfileResonanceStatus(queryClient, memberId, previous);
          return;
        }

        const next: ResonanceStatus = {
          isResonated: result.isResonated,
          isMutual: result.isMutual,
          conversationId: result.conversationId,
        };

        queryClient.setQueryData(queryKey, next);
        syncProfileResonanceStatus(queryClient, memberId, next);
        window.dispatchEvent(new Event(RESONANCE_CHANGE_EVENT));
      })
      .finally(() => {
        setIsToggling(false);
      });
  }, [memberId, query.data, queryClient, queryKey]);

  const state = query.data ?? EMPTY_STATUS;

  return {
    ...state,
    toggle,
    mounted: query.isFetchedAfterMount || Boolean(query.data),
    isPending: isToggling,
  };
}
