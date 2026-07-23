"use client";

import { createContext, useContext, useEffect } from "react";
import { applyFrequencyColorVariables } from "@/lib/frequency-color/css";
import { DEFAULT_FREQUENCY_COLOR } from "@/lib/frequency-color/palette";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";

type FrequencyColorContextValue = {
  color: FrequencyColorHex;
};

const FrequencyColorContext = createContext<FrequencyColorContextValue>({
  color: DEFAULT_FREQUENCY_COLOR,
});

export function useFrequencyColor(): FrequencyColorContextValue {
  return useContext(FrequencyColorContext);
}

type FrequencyColorProviderProps = {
  color: FrequencyColorHex;
  children: React.ReactNode;
};

export function FrequencyColorProvider({
  color,
  children,
}: FrequencyColorProviderProps) {
  useEffect(() => {
    applyFrequencyColorVariables(document.documentElement, color);
  }, [color]);

  return (
    <FrequencyColorContext.Provider value={{ color }}>
      {children}
    </FrequencyColorContext.Provider>
  );
}
