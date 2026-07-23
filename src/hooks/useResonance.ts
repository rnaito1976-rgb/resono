"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  getResonanceStatusAction,
  toggleResonanceAction,
} from "@/lib/actions/resonance";
import { RESONANCE_CHANGE_EVENT } from "@/lib/resonance";
import { MESSAGES_CHANGE_EVENT, dispatchMessagesChange } from "@/lib/messages/events";

type ResonanceState = {
  isResonated: boolean;
  isMutual: boolean;
  conversationId: string | null;
};

export function useResonance(memberId: string) {
  const [state, setState] = useState<ResonanceState>({
    isResonated: false,
    isMutual: false,
    conversationId: null,
  });
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const next = await getResonanceStatusAction(memberId);
      setState(next);
    });
  }, [memberId]);

  useEffect(() => {
    setMounted(true);
    refresh();

    const handleChange = () => refresh();
    window.addEventListener(RESONANCE_CHANGE_EVENT, handleChange);
    window.addEventListener(MESSAGES_CHANGE_EVENT, handleChange);

    return () => {
      window.removeEventListener(RESONANCE_CHANGE_EVENT, handleChange);
      window.removeEventListener(MESSAGES_CHANGE_EVENT, handleChange);
    };
  }, [refresh]);

  const toggle = useCallback(() => {
    startTransition(async () => {
      const result = await toggleResonanceAction(memberId);

      if (result.error) {
        return;
      }

      setState({
        isResonated: result.isResonated,
        isMutual: result.isMutual,
        conversationId: result.conversationId,
      });

      window.dispatchEvent(new Event(RESONANCE_CHANGE_EVENT));
      dispatchMessagesChange();
    });
  }, [memberId]);

  return {
    ...state,
    toggle,
    mounted,
    isPending,
  };
}
