import type { FrequencyColorHex } from "@/lib/frequency-color/types";

export type WelcomeOnboardingAnswers = {
  artists: string[];
  parts: string[];
  sounds: string[];
  frequencyColor?: FrequencyColorHex;
};

export type MusicDnaResult = {
  label: string;
  stars: number;
};

export type WelcomeStep =
  | "intro"
  | "artists"
  | "parts"
  | "sounds"
  | "color"
  | "analysis"
  | "results";

export const WELCOME_QUESTION_STEPS = [
  "artists",
  "parts",
  "sounds",
  "color",
] as const satisfies readonly WelcomeStep[];

export type WelcomeQuestionStep = (typeof WELCOME_QUESTION_STEPS)[number];

export const WELCOME_ARTIST_MIN = 1;
export const WELCOME_ARTIST_MAX = 20;
