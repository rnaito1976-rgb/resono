"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { getUnreadCountAction } from "@/lib/actions/resonance";
import { MESSAGES_CHANGE_EVENT } from "@/lib/messages/events";
import { RESONANCE_CHANGE_EVENT } from "@/lib/resonance";

export function useUnreadCount(enabled = true) {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();

  const refresh = useCallback(() => {
    if (!enabled) {
      setCount(0);
      return;
    }

    startTransition(async () => {
      const next = await getUnreadCountAction();
      setCount(next);
    });
  }, [enabled]);

  useEffect(() => {
    setMounted(true);
    refresh();

    const handleChange = () => refresh();
    window.addEventListener(MESSAGES_CHANGE_EVENT, handleChange);
    window.addEventListener(RESONANCE_CHANGE_EVENT, handleChange);

    return () => {
      window.removeEventListener(MESSAGES_CHANGE_EVENT, handleChange);
      window.removeEventListener(RESONANCE_CHANGE_EVENT, handleChange);
    };
  }, [refresh]);

  return { count: mounted ? count : 0, refresh };
}
