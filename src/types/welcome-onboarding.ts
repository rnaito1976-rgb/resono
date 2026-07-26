export type WelcomeOnboardingAnswers = {
  artists: string[];
  parts: string[];
  sounds: string[];
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
  | "analysis"
  | "results";

export const WELCOME_QUESTION_STEPS = [
  "artists",
  "parts",
  "sounds",
] as const satisfies readonly WelcomeStep[];

export type WelcomeQuestionStep = (typeof WELCOME_QUESTION_STEPS)[number];

export const WELCOME_ARTIST_MIN = 3;
export const WELCOME_ARTIST_MAX = 20;
