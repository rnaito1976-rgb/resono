import type { Member } from "@/types/member";
import type { MusicDnaResult, WelcomeOnboardingAnswers } from "@/types/welcome-onboarding";

const GENRE_KEYS = [
  "Alternative Rock",
  "British Rock",
  "Indie",
  "Ambient",
] as const;

type GenreKey = (typeof GENRE_KEYS)[number];

const ARTIST_GENRE_WEIGHTS: Record<string, Partial<Record<GenreKey, number>>> = {
  Radiohead: { "Alternative Rock": 5, Ambient: 4, Indie: 3 },
  Oasis: { "British Rock": 5, "Alternative Rock": 3 },
  羊文学: { Indie: 5, Ambient: 3 },
  "King Gnu": { "Alternative Rock": 4, Indie: 4 },
  "The 1975": { Indie: 5, "Alternative Rock": 3 },
};

const COVER_GENRE_WEIGHTS: Record<string, Partial<Record<GenreKey, number>>> = {
  "No Surprises": { Ambient: 4, "Alternative Rock": 3 },
  Just: { "Alternative Rock": 4, Indie: 3 },
  Creep: { "Alternative Rock": 5, "British Rock": 2 },
  怪獣: { Indie: 4, "Alternative Rock": 3 },
  丸ノ内サディスティック: { Indie: 3, "Alternative Rock": 2 },
};

const PART_GENRE_WEIGHTS: Record<string, Partial<Record<GenreKey, number>>> = {
  Vocal: { Indie: 1, Ambient: 1 },
  Guitar: { "Alternative Rock": 2, "British Rock": 1 },
  Bass: { "Alternative Rock": 1, Indie: 1 },
  Drums: { "British Rock": 2, "Alternative Rock": 1 },
  Keyboard: { Ambient: 2, Indie: 1 },
  Other: { Indie: 1 },
};

const BAND_STYLE_WEIGHTS: Record<string, Partial<Record<GenreKey, number>>> = {
  コピー中心: { "British Rock": 2, "Alternative Rock": 1 },
  オリジナル中心: { Indie: 2, Ambient: 1 },
  どちらも: { "Alternative Rock": 2, Indie: 2 },
  まだ決めていない: { Ambient: 1, Indie: 1 },
};

function scoreToStars(score: number): number {
  if (score >= 14) return 5;
  if (score >= 10) return 4;
  if (score >= 6) return 3;
  if (score >= 3) return 2;
  return 1;
}

function applyWeights(
  scores: Record<GenreKey, number>,
  weights: Partial<Record<GenreKey, number>> | undefined
) {
  if (!weights) {
    return;
  }

  for (const genre of GENRE_KEYS) {
    scores[genre] += weights[genre] ?? 0;
  }
}

export function analyzeMusicDna(answers: WelcomeOnboardingAnswers): MusicDnaResult[] {
  const scores: Record<GenreKey, number> = {
    "Alternative Rock": 2,
    "British Rock": 2,
    Indie: 2,
    Ambient: 2,
  };

  for (const artist of answers.artists) {
    applyWeights(scores, ARTIST_GENRE_WEIGHTS[artist]);
  }

  for (const song of answers.coverSongs) {
    applyWeights(scores, COVER_GENRE_WEIGHTS[song]);
  }

  for (const part of answers.parts) {
    applyWeights(scores, PART_GENRE_WEIGHTS[part]);
  }

  applyWeights(scores, BAND_STYLE_WEIGHTS[answers.bandStyle]);

  return GENRE_KEYS.map((label) => ({
    label,
    stars: scoreToStars(scores[label]),
  })).sort((a, b) => b.stars - a.stars);
}

function memberMatchScore(member: Member, answers: WelcomeOnboardingAnswers): number {
  let score = member.resonanceRate / 100;

  for (const artist of answers.artists) {
    if (member.music.favoriteArtists.some((entry) => entry.includes(artist) || artist.includes(entry))) {
      score += 3;
    }
    if (member.tags.some((tag) => tag.includes(artist) || artist.includes(tag))) {
      score += 1;
    }
  }

  for (const part of answers.parts) {
    const normalized = part.toLowerCase();
    if (
      member.music.instruments.some((instrument) =>
        instrument.toLowerCase().includes(normalized)
      ) ||
      member.lookingFor.parts.some((entry) => entry.toLowerCase().includes(normalized))
    ) {
      score += 2;
    }
  }

  return score;
}

export function pickMatchedMembers(
  members: Member[],
  answers: WelcomeOnboardingAnswers,
  limit = 3
): Member[] {
  return [...members]
    .sort((a, b) => memberMatchScore(b, answers) - memberMatchScore(a, answers))
    .slice(0, limit);
}

export function renderStars(count: number): string {
  return "★".repeat(count) + "☆".repeat(Math.max(0, 5 - count));
}
