"use client";

import { useEffect, useState } from "react";

const KEYBOARD_THRESHOLD_PX = 120;

/** Detects the mobile software keyboard by comparing the visual viewport to the layout viewport. */
export function useKeyboardOpen(): boolean {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) {
      return;
    }

    const update = () => {
      setIsOpen(window.innerHeight - viewport.height > KEYBOARD_THRESHOLD_PX);
    };

    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    update();

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return isOpen;
}
