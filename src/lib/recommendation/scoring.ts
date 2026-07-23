import type { Member } from "@/types/member";

export const RECOMMENDATION_WEIGHTS = {
  lookingFor: 35,
  artists: 20,
  genres: 15,
  activity: 10,
  location: 10,
  fashion: 5,
  aiProfile: 5,
} as const;

export type RecommendationWeightKey = keyof typeof RECOMMENDATION_WEIGHTS;

/** Future extension hooks (e.g. aiScore, videoAnalysis). Set weight > 0 when ready. */
export type RecommendationExtensionWeights = Record<string, number>;

export const RECOMMENDATION_EXTENSION_WEIGHTS: RecommendationExtensionWeights = {
  // aiScore: 10,
  // videoAnalysis: 8,
};

export type RecruitmentMatchLabel = "sought-by-target";

export type RecommendationBreakdown = Record<string, number>;

export type RecommendationResult = {
  score: number;
  breakdown: RecommendationBreakdown;
  factors: Record<RecommendationWeightKey, number>;
  recruitmentLabel?: RecruitmentMatchLabel;
  /** Target's open parts that relate to the match */
  highlightedParts: string[];
};

export type RankedRecommendation = {
  member: Member;
  recommendation: RecommendationResult;
};

function toStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.filter((value): value is string => typeof value === "string");
}

function intersection(a: unknown, b: unknown): string[] {
  const left = toStringArray(a);
  const right = toStringArray(b);
  const normalized = new Set(right.map((item) => item.toLowerCase()));

  return left.filter((item) => normalized.has(item.toLowerCase()));
}

function overlapRatio(
  left: string[],
  right: string[],
  cap = 3,
  emptyFallback = 0.12
): number {
  if (!left.length && !right.length) {
    return emptyFallback;
  }

  const shared = intersection(left, right);
  return Math.min(1, shared.length / cap);
}

function normalizePart(value: string): string {
  return value.trim().toLowerCase();
}

function partsMatch(left: string, right: string): boolean {
  const a = normalizePart(left);
  const b = normalizePart(right);

  return a === b || a.includes(b) || b.includes(a);
}

function matchParts(needles: string[], haystack: string[]): string[] {
  return needles.filter((needle) =>
    haystack.some((item) => partsMatch(needle, item))
  );
}

function getInfluencesByPrefix(member: Member, prefix: string): string[] {
  return toStringArray(member.portrait.influences)
    .filter((item) => item.startsWith(`${prefix}:`))
    .map((item) => item.slice(prefix.length + 1));
}

function scoreLookingFor(
  viewer: Member,
  target: Member
): {
  lookingForFactor: number;
  recruitmentLabel?: RecruitmentMatchLabel;
  highlightedParts: string[];
} {
  const viewerInstruments = toStringArray(viewer.music.instruments);
  const targetInstruments = toStringArray(target.music.instruments);
  const viewerLooking = toStringArray(viewer.lookingFor.parts);
  const targetLooking = toStringArray(target.lookingFor.parts);

  const soughtByTarget = matchParts(targetLooking, viewerInstruments);
  if (soughtByTarget.length > 0) {
    return {
      lookingForFactor: 1,
      recruitmentLabel: "sought-by-target",
      highlightedParts: targetLooking.filter((part) =>
        soughtByTarget.some((match) => partsMatch(part, match))
      ),
    };
  }

  const recruitmentMatch = matchParts(viewerLooking, targetInstruments);
  if (recruitmentMatch.length > 0) {
    return {
      lookingForFactor: 0.85,
      highlightedParts: targetLooking,
    };
  }

  return {
    lookingForFactor: targetLooking.length || viewerLooking.length ? 0 : 0.15,
    highlightedParts: targetLooking,
  };
}

function scoreActivity(viewer: Member, target: Member): number {
  const activitySignals = [
    ...getInfluencesByPrefix(viewer, "活動"),
    ...getInfluencesByPrefix(viewer, "スタイル"),
    ...getInfluencesByPrefix(viewer, "バンド"),
  ];
  const targetSignals = [
    ...getInfluencesByPrefix(target, "活動"),
    ...getInfluencesByPrefix(target, "スタイル"),
    ...getInfluencesByPrefix(target, "バンド"),
  ];

  return overlapRatio(activitySignals, targetSignals, 2, 0.1);
}

function scoreFashion(viewer: Member, target: Member): number {
  return overlapRatio(
    toStringArray(viewer.fashion.brands),
    toStringArray(target.fashion.brands),
    2,
    0.08
  );
}

function scoreAiProfile(viewer: Member, target: Member): number {
  const tagScore = overlapRatio(viewer.tags, target.tags, 3, 0.1);
  const influenceScore = overlapRatio(
    viewer.portrait.influences,
    target.portrait.influences,
    3,
    0.1
  );
  const commentScore =
    viewer.aiComment &&
    target.aiComment &&
    viewer.aiComment.slice(0, 12) === target.aiComment.slice(0, 12)
      ? 0.35
      : 0;

  return Math.min(1, tagScore * 0.45 + influenceScore * 0.45 + commentScore);
}

function computeFactorScores(
  viewer: Member,
  target: Member,
  lookingForFactor: number
): Record<RecommendationWeightKey, number> {
  return {
    lookingFor: lookingForFactor,
    artists: overlapRatio(
      viewer.music.favoriteArtists,
      target.music.favoriteArtists
    ),
    genres: overlapRatio(viewer.music.genres, target.music.genres),
    activity: scoreActivity(viewer, target),
    location:
      viewer.portrait.location &&
      target.portrait.location &&
      viewer.portrait.location === target.portrait.location
        ? 1
        : 0,
    fashion: scoreFashion(viewer, target),
    aiProfile: scoreAiProfile(viewer, target),
  };
}

type CalculateRecommendationOptions = {
  extensionScores?: Record<string, number>;
  extensionWeights?: RecommendationExtensionWeights;
};

export function calculateRecommendationScore(
  viewer: Member,
  target: Member,
  options?: CalculateRecommendationOptions
): RecommendationResult {
  const lookingForMeta = scoreLookingFor(viewer, target);
  const factors = computeFactorScores(
    viewer,
    target,
    lookingForMeta.lookingForFactor
  );
  const breakdown: RecommendationBreakdown = {};
  let score = 0;

  for (const [key, weight] of Object.entries(RECOMMENDATION_WEIGHTS) as [
    RecommendationWeightKey,
    number,
  ][]) {
    const points = factors[key] * weight;
    breakdown[key] = Math.round(points * 10) / 10;
    score += points;
  }

  const extensionWeights =
    options?.extensionWeights ?? RECOMMENDATION_EXTENSION_WEIGHTS;

  for (const [key, weight] of Object.entries(extensionWeights)) {
    if (weight <= 0) {
      continue;
    }

    const factor = options?.extensionScores?.[key] ?? 0;
    const points = factor * weight;
    breakdown[key] = Math.round(points * 10) / 10;
    score += points;
  }

  return {
    score: Math.round(score),
    breakdown,
    factors,
    recruitmentLabel: lookingForMeta.recruitmentLabel,
    highlightedParts: lookingForMeta.highlightedParts,
  };
}

export function rankRecommendations(
  viewer: Member,
  candidates: Member[],
  options?: CalculateRecommendationOptions
): RankedRecommendation[] {
  return candidates
    .map((member) => ({
      member,
      recommendation: calculateRecommendationScore(viewer, member, options),
    }))
    .sort((a, b) => b.recommendation.score - a.recommendation.score);
}

export function getRecruitmentMatchLabelText(
  _label: RecruitmentMatchLabel
): string {
  return "あなたが探されているメンバーです";
}
