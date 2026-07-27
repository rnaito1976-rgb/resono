"use client";

import { type RefObject, useEffect } from "react";

/** Scrolls focused form controls into view inside a scroll container (mobile keyboard friendly). */
export function useFocusScrollIntoView(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (
        !(target instanceof HTMLInputElement) &&
        !(target instanceof HTMLTextAreaElement) &&
        !(target instanceof HTMLSelectElement)
      ) {
        return;
      }

      window.requestAnimationFrame(() => {
        target.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
    };

    container.addEventListener("focusin", handleFocusIn);
    return () => container.removeEventListener("focusin", handleFocusIn);
  }, [containerRef]);
}
