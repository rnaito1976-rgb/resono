import { parseArtistSongLine } from "@/lib/form";
import { getProfileGrowFieldSection } from "@/lib/profile/grow/labels";
import { PROFILE_GROW_OTHER_LABEL } from "@/lib/profile/grow/catalogs";
import { WELCOME_OTHER_PART_LABEL } from "@/lib/welcome/onboarding-data";
import type { ProfileGrowCandidate, ProfileGrowFieldKey, ProfileGrowQuestion } from "@/types/profile-grow";

const OTHER_LABELS = new Set([
  PROFILE_GROW_OTHER_LABEL,
  WELCOME_OTHER_PART_LABEL,
  "その他",
  "Other（自由入力）",
]);

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

function createCandidate(
  field: ProfileGrowFieldKey,
  value: string,
  detail?: string
): ProfileGrowCandidate {
  return {
    id: `${field}-${normalizeToken(`${value}-${detail ?? ""}`)}`,
    field,
    section: getProfileGrowFieldSection(field),
    value: value.trim(),
    detail: detail?.trim() || undefined,
  };
}

function cleanSelectionValues(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || OTHER_LABELS.has(trimmed)) {
      continue;
    }

    const key = normalizeToken(trimmed);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

export function createCandidatesFromSelection(
  question: ProfileGrowQuestion,
  values: string[]
): ProfileGrowCandidate[] {
  const cleaned = cleanSelectionValues(values);
  if (cleaned.length === 0) {
    return [];
  }

  if (question.picker === "cover") {
    return cleaned.map((value) => {
      const parsed = parseArtistSongLine(value);
      return createCandidate("wantToCover", parsed.title, parsed.artist);
    });
  }

  if (question.field === "favoriteSongs") {
    return cleaned.map((value) => {
      const parsed = parseArtistSongLine(value);
      const display = parsed.artist ? `${parsed.artist} - ${parsed.title}` : parsed.title;
      return createCandidate("favoriteSongs", display);
    });
  }

  return cleaned.map((value) => createCandidate(question.field, value));
}

export function extractFreeTextCandidates(
  question: ProfileGrowQuestion,
  answer: string
): ProfileGrowCandidate[] {
  const trimmed = answer.trim();
  if (!trimmed) {
    return [];
  }

  return [createCandidate(question.field, trimmed)];
}

export function formatSelectionSummary(values: string[]): string {
  return cleanSelectionValues(values).join("、");
}
