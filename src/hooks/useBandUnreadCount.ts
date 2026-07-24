"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { getBandUnreadCountAction } from "@/lib/actions/bands";
import { BANDS_CHANGE_EVENT } from "@/lib/bands/events";
import { queryKeys } from "@/lib/query/keys";

const BAND_UNREAD_STALE_MS = 60 * 1000;

export function useBandUnreadCount(enabled = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.bands.unreadCount(),
    queryFn: getBandUnreadCountAction,
    enabled,
    staleTime: BAND_UNREAD_STALE_MS,
    gcTime: 10 * 60 * 1000,
  });

  const refresh = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.bands.unreadCount(),
    });
  }, [queryClient]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleChange = () => refresh();
    window.addEventListener(BANDS_CHANGE_EVENT, handleChange);

    return () => {
      window.removeEventListener(BANDS_CHANGE_EVENT, handleChange);
    };
  }, [enabled, refresh]);

  return {
    count: enabled ? (query.data ?? 0) : 0,
    refresh,
  };
}
