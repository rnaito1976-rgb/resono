"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { applyFrequencyColorVariables } from "@/lib/frequency-color/css";
import { DEFAULT_FREQUENCY_COLOR } from "@/lib/frequency-color/palette";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { readStoredThemeColor, writeStoredThemeColor } from "@/lib/theme/storage";

type SetColorOptions = {
  persist?: boolean;
};

type FrequencyColorContextValue = {
  color: FrequencyColorHex;
  setColor: (color: FrequencyColorHex, options?: SetColorOptions) => void;
};

const FrequencyColorContext = createContext<FrequencyColorContextValue>({
  color: DEFAULT_FREQUENCY_COLOR,
  setColor: () => {},
});

export function useFrequencyColor(): FrequencyColorContextValue {
  return useContext(FrequencyColorContext);
}

type FrequencyColorProviderProps = {
  initialColor?: FrequencyColorHex;
  children: ReactNode;
};

export function FrequencyColorProvider({
  initialColor = DEFAULT_FREQUENCY_COLOR,
  children,
}: FrequencyColorProviderProps) {
  const pathname = usePathname();
  const [color, setColorState] = useState<FrequencyColorHex>(initialColor);
  const bootstrappedRef = useRef(false);

  const setColor = useCallback((next: FrequencyColorHex, options?: SetColorOptions) => {
    setColorState(next);
    applyFrequencyColorVariables(document.documentElement, next);
    if (options?.persist !== false) {
      writeStoredThemeColor(next);
    }
  }, []);

  useEffect(() => {
    if (bootstrappedRef.current) {
      return;
    }
    bootstrappedRef.current = true;

    const stored = readStoredThemeColor();
    if (stored) {
      setColorState(stored);
      applyFrequencyColorVariables(document.documentElement, stored);
      return;
    }

    if (pathname === "/") {
      setColorState(initialColor);
      applyFrequencyColorVariables(document.documentElement, initialColor);
      writeStoredThemeColor(initialColor);
      return;
    }

    let cancelled = false;

    void fetch("/api/theme")
      .then((response) => response.json())
      .then((payload: { color?: FrequencyColorHex }) => {
        if (!cancelled && payload.color) {
          setColorState(payload.color);
          applyFrequencyColorVariables(document.documentElement, payload.color);
          writeStoredThemeColor(payload.color);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialColor, pathname]);

  return (
    <FrequencyColorContext.Provider value={{ color, setColor }}>
      {children}
    </FrequencyColorContext.Provider>
  );
}
