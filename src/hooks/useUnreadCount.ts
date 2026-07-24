"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { getUnreadCountAction } from "@/lib/actions/resonance";
import { queryKeys } from "@/lib/query/keys";
import { MESSAGES_CHANGE_EVENT } from "@/lib/messages/events";
import { RESONANCE_CHANGE_EVENT } from "@/lib/resonance";

const UNREAD_STALE_MS = 60 * 1000;

export function useUnreadCount(enabled = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.resonance.unreadCount(),
    queryFn: getUnreadCountAction,
    enabled,
    staleTime: UNREAD_STALE_MS,
    gcTime: 10 * 60 * 1000,
  });

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.resonance.unreadCount(),
    });
  }, [queryClient]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleChange = () => refresh();
    window.addEventListener(MESSAGES_CHANGE_EVENT, handleChange);
    window.addEventListener(RESONANCE_CHANGE_EVENT, handleChange);

    return () => {
      window.removeEventListener(MESSAGES_CHANGE_EVENT, handleChange);
      window.removeEventListener(RESONANCE_CHANGE_EVENT, handleChange);
    };
  }, [enabled, refresh]);

  return {
    count: enabled ? (query.data ?? 0) : 0,
    refresh,
  };
}
