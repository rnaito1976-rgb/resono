export type FrequencyColorHex = `#${string}`;

export type FrequencyColorSwatch = {
  id: string;
  hex: FrequencyColorHex;
  label: string;
};

/** Extensible source metadata for future AI / resonance / band colors. */
export type FrequencyColorSource =
  | { kind: "user-selected"; hex: FrequencyColorHex }
  | { kind: "ai-suggested"; hex: FrequencyColorHex; reason?: string }
  | {
      kind: "resonance-blend";
      hex: FrequencyColorHex;
      from: [FrequencyColorHex, FrequencyColorHex];
    }
  | { kind: "band"; hex: FrequencyColorHex; bandId?: string };

export type UserFrequencyColor = {
  hex: FrequencyColorHex;
  source: FrequencyColorSource;
};
