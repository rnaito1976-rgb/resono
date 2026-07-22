"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RESONANCE_CHANGE_EVENT,
  getResonatedIds,
  toggleResonance,
} from "@/lib/resonance";

export function useResonance(memberId: string) {
  const [isResonated, setIsResonated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const sync = () => {
      setIsResonated(getResonatedIds().includes(memberId));
    };

    sync();
    window.addEventListener(RESONANCE_CHANGE_EVENT, sync);
    return () => window.removeEventListener(RESONANCE_CHANGE_EVENT, sync);
  }, [memberId]);

  const toggle = useCallback(() => {
    setIsResonated(toggleResonance(memberId));
  }, [memberId]);

  return { isResonated, toggle, mounted };
}
