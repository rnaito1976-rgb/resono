import type { Member } from "@/types/member";

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

function unionScore(items: string[], weight: number): number {
  return Math.min(weight, items.length * (weight / 3));
}

/**
 * AI推定の共鳴度。
 * プロフィールの入力量ではなく、価値観・感性・興味の近さから算出する。
 */
export function calculateResonanceMatch(
  viewer: Member,
  target: Member
): number {
  if (viewer.id === target.id) {
    return 100;
  }

  let score = 38;

  score += unionScore(
    intersection(viewer.music.favoriteArtists, target.music.favoriteArtists),
    22
  );
  score += unionScore(intersection(viewer.tags, target.tags), 18);
  score += unionScore(
    intersection(viewer.portrait.influences, target.portrait.influences),
    16
  );

  const viewerValues = toStringArray(viewer.portrait.influences).filter((item) =>
    item.startsWith("価値観:")
  );
  const targetValues = toStringArray(target.portrait.influences).filter((item) =>
    item.startsWith("価値観:")
  );
  score += unionScore(intersection(viewerValues, targetValues), 12);

  score += unionScore(
    intersection(viewer.music.genres, target.music.genres),
    10
  );

  score += unionScore(
    intersection(viewer.fashion.brands, target.fashion.brands),
    8
  );

  const viewerParts = toStringArray(viewer.lookingFor.parts);
  const targetInstruments = toStringArray(target.music.instruments);

  if (viewerParts.length && targetInstruments.length) {
    const partMatch = viewerParts.some((part) =>
      targetInstruments.some(
        (instrument) =>
          instrument.toLowerCase().includes(part.toLowerCase()) ||
          part.toLowerCase().includes(instrument.toLowerCase())
      )
    );
    if (partMatch) {
      score += 8;
    }
  }

  const hashSeed = `${viewer.id}:${target.id}`.split("").reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
  );
  score += hashSeed % 7;

  return Math.min(99, Math.max(41, Math.round(score)));
}

export function getTopResonanceMatches(
  viewer: Member,
  candidates: Member[],
  limit = 3
) {
  return candidates
    .filter((member) => member.id !== viewer.id)
    .map((member) => ({
      member,
      score: calculateResonanceMatch(viewer, member),
      reason: buildMatchReason(viewer, member),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export type ResonanceReason = {
  score: number;
  commonPoints: string[];
  aiComment: string;
};

function collectCommonPoints(viewer: Member, target: Member): string[] {
  const points: string[] = [];

  points.push(
    ...intersection(viewer.music.favoriteArtists, target.music.favoriteArtists)
  );
  points.push(...intersection(viewer.music.genres, target.music.genres));
  points.push(...intersection(viewer.fashion.brands, target.fashion.brands));
  points.push(...intersection(viewer.tags, target.tags));
  points.push(
    ...intersection(viewer.portrait.influences, target.portrait.influences).map(
      (item) => item.replace(/^価値観:/, "")
    )
  );

  return [...new Set(points)].slice(0, 4);
}

function buildAiResonanceComment(
  viewer: Member,
  target: Member,
  commonPoints: string[]
): string {
  const sharedTags = intersection(viewer.tags, target.tags);
  if (sharedTags.length >= 2) {
    return `「${sharedTags[0]}」と「${sharedTags[1]}」を大切にする感性が重なっています。`;
  }

  if (sharedTags.length) {
    return `「${sharedTags[0]}」という世界観の温度感が近いようです。`;
  }

  const sharedArtists = intersection(
    viewer.music.favoriteArtists,
    target.music.favoriteArtists
  );
  if (sharedArtists.length) {
    return `${sharedArtists[0]} あたりの音楽性から、静かな余白を大切にする世界観が共通しています。`;
  }

  if (commonPoints.length >= 2) {
    return `「${commonPoints[0]}」と「${commonPoints[1]}」に触れる感性が、自然な会話のきっかけになりそうです。`;
  }

  if (commonPoints.length === 1) {
    return `「${commonPoints[0]}」を通じて、価値観のリズムが近いと感じます。`;
  }

  return "価値観のリズムが近く、無理のない距離感で話を始められそうです。";
}

export function buildResonanceReason(
  viewer: Member,
  target: Member
): ResonanceReason {
  const commonPoints = collectCommonPoints(viewer, target);

  return {
    score: calculateResonanceMatch(viewer, target),
    commonPoints,
    aiComment: buildAiResonanceComment(viewer, target, commonPoints),
  };
}

export function buildConversationStarters(
  viewer: Member,
  target: Member
): string[] {
  const starters: string[] = [];
  const sharedArtists = intersection(
    viewer.music.favoriteArtists,
    target.music.favoriteArtists
  );
  const sharedGenres = intersection(viewer.music.genres, target.music.genres);
  const sharedBrands = intersection(viewer.fashion.brands, target.fashion.brands);
  const sharedTags = intersection(viewer.tags, target.tags);

  if (sharedArtists.length) {
    starters.push(
      `${sharedArtists[0]}の曲で、最近ハマっているものはありますか？`
    );
  }

  if (sharedGenres.length) {
    starters.push(
      `${sharedGenres[0]}系の音楽、どんなシチュエーションで聴いていますか？`
    );
  }

  if (sharedBrands.length) {
    starters.push(
      `${sharedBrands[0]}が好きとのことですが、きっかけを教えてください。`
    );
  }

  if (sharedTags.length && starters.length < 3) {
    starters.push(`「${sharedTags[0]}」というタグ、どんな意味を込めていますか？`);
  }

  const fallbacks = [
    "最近、世界観が近いと感じたアーティストや作品はありますか？",
    "音楽以外で、感性が近いと感じるものはありますか？",
    "どんな空気感の場所で過ごすことが多いですか？",
  ];

  for (const fallback of fallbacks) {
    if (starters.length >= 3) {
      break;
    }
    if (!starters.includes(fallback)) {
      starters.push(fallback);
    }
  }

  return starters.slice(0, 3);
}

function buildMatchReason(viewer: Member, target: Member): string {
  const sharedArtists = intersection(
    viewer.music.favoriteArtists,
    target.music.favoriteArtists
  );
  if (sharedArtists.length) {
    return `${sharedArtists[0]} あたりの音楽性が近い`;
  }

  const sharedTags = intersection(viewer.tags, target.tags);
  if (sharedTags.length) {
    return `「${sharedTags[0]}」という感性が重なる`;
  }

  const sharedInfluences = intersection(
    viewer.portrait.influences,
    target.portrait.influences
  );
  if (sharedInfluences.length) {
    return `大切にしている価値観が近い`;
  }

  return "価値観の温度感が近い";
}
