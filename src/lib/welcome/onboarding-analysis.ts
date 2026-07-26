import type { Member } from "@/types/member";
import type { MusicDnaResult, WelcomeOnboardingAnswers } from "@/types/welcome-onboarding";

const DEFAULT_DNA: MusicDnaResult[] = [
  { label: "Alternative Rock", stars: 4 },
  { label: "Indie Rock", stars: 4 },
  { label: "UK Rock", stars: 3 },
  { label: "J-Rock", stars: 3 },
];

function scoreToStars(score: number): number {
  if (score >= 8) return 5;
  if (score >= 5) return 4;
  if (score >= 3) return 3;
  return 2;
}

export function analyzeMusicDna(answers: WelcomeOnboardingAnswers): MusicDnaResult[] {
  if (answers.sounds.length === 0) {
    return DEFAULT_DNA;
  }

  const scored = answers.sounds.map((sound, index) => {
    let score = answers.sounds.length - index;

    for (const artist of answers.artists) {
      if (artist.toLowerCase().includes(sound.toLowerCase().split(" ")[0] ?? "")) {
        score += 1;
      }
    }

    return {
      label: sound,
      stars: scoreToStars(score),
    };
  });

  return scored.slice(0, 4);
}

function effectiveParts(parts: string[]): string[] {
  return parts.filter((part) => part !== "Other");
}

function memberMatchScore(member: Member, answers: WelcomeOnboardingAnswers): number {
  let score = member.resonanceRate / 100;

  for (const artist of answers.artists) {
    if (
      member.music.favoriteArtists.some(
        (entry) => entry.includes(artist) || artist.includes(entry)
      )
    ) {
      score += 3;
    }
    if (member.tags.some((tag) => tag.includes(artist) || artist.includes(tag))) {
      score += 1;
    }
  }

  for (const part of effectiveParts(answers.parts)) {
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

  for (const sound of answers.sounds) {
    const normalized = sound.toLowerCase();
    if (
      member.music.genres.some(
        (genre) => genre.toLowerCase().includes(normalized) || normalized.includes(genre.toLowerCase())
      ) ||
      member.tags.some((tag) => tag.toLowerCase().includes(normalized))
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
