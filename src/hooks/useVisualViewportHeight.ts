"use client";

import { useEffect, useState } from "react";

function readViewportHeight(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  return window.visualViewport?.height ?? window.innerHeight;
}

/** Keeps a fixed chat shell aligned with the visible viewport when the mobile keyboard opens. */
export function useVisualViewportHeight(): number {
  const [height, setHeight] = useState(readViewportHeight);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) {
      return;
    }

    const update = () => {
      setHeight(viewport.height);
    };

    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    update();

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return height;
}
