export type WelcomeOnboardingAnswers = {
  artists: string[];
  coverSongs: string[];
  parts: string[];
  bandStyle: string;
};

export type MusicDnaResult = {
  label: string;
  stars: number;
};

export type WelcomeStep =
  | "intro"
  | "artists"
  | "covers"
  | "parts"
  | "band-style"
  | "analysis"
  | "results";

export const WELCOME_QUESTION_STEPS = [
  "artists",
  "covers",
  "parts",
  "band-style",
] as const satisfies readonly WelcomeStep[];

export type WelcomeQuestionStep = (typeof WELCOME_QUESTION_STEPS)[number];
