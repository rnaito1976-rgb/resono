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

function getInfluencesByPrefix(member: Member, prefix: string): string[] {
  return toStringArray(member.portrait.influences)
    .filter((item) => item.startsWith(`${prefix}:`))
    .map((item) => item.slice(prefix.length + 1));
}

function formatInfluencePoint(influence: string): string | null {
  const [prefix, ...rest] = influence.split(":");
  const value = rest.join(":").trim();
  if (!value) {
    return null;
  }

  switch (prefix) {
    case "バンド":
      return value;
    case "活動":
      return `ライブは${value}が理想`;
    case "スタイル":
      return value;
    case "大切":
      return value;
    case "メンバー":
      return `${value}なメンバーと長く続けられそう`;
    case "会話":
      return `会話は${value}が心地いい`;
    default:
      return value;
  }
}

/**
 * AI推定の共鳴度。
 * プロフィールの入力量ではなく、音楽的・人間的な相性から算出する。
 */
export function calculateResonanceMatch(
  viewer: Member,
  target: Member
): number {
  if (viewer.id === target.id) {
    return 100;
  }

  let score = 36;

  score += unionScore(
    intersection(viewer.music.favoriteArtists, target.music.favoriteArtists),
    18
  );
  score += unionScore(intersection(viewer.music.genres, target.music.genres), 20);
  score += unionScore(
    intersection(getInfluencesByPrefix(viewer, "スタイル"), getInfluencesByPrefix(target, "スタイル")),
    14
  );
  score += unionScore(
    intersection(getInfluencesByPrefix(viewer, "活動"), getInfluencesByPrefix(target, "活動")),
    12
  );
  score += unionScore(
    intersection(getInfluencesByPrefix(viewer, "大切"), getInfluencesByPrefix(target, "大切")),
    12
  );
  score += unionScore(
    intersection(getInfluencesByPrefix(viewer, "メンバー"), getInfluencesByPrefix(target, "メンバー")),
    10
  );
  score += unionScore(
    intersection(getInfluencesByPrefix(viewer, "バンド"), getInfluencesByPrefix(target, "バンド")),
    10
  );
  score += unionScore(
    intersection(getInfluencesByPrefix(viewer, "会話"), getInfluencesByPrefix(target, "会話")),
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

  if (
    viewer.portrait.location &&
    target.portrait.location &&
    viewer.portrait.location === target.portrait.location
  ) {
    score += 6;
  }

  return Math.min(99, Math.max(41, Math.round(score)));
}

export type ResonanceReason = {
  score: number;
  commonPoints: string[];
  aiComment: string;
};

function collectCommonPoints(viewer: Member, target: Member): string[] {
  const points: string[] = [];

  for (const genre of intersection(viewer.music.genres, target.music.genres)) {
    points.push(`${genre}への熱量が近い`);
  }

  for (const influence of intersection(
    viewer.portrait.influences,
    target.portrait.influences
  )) {
    const formatted = formatInfluencePoint(influence);
    if (formatted) {
      points.push(formatted);
    }
  }

  for (const artist of intersection(
    viewer.music.favoriteArtists,
    target.music.favoriteArtists
  ).slice(0, 1)) {
    points.push(`${artist}あたりの音楽性が近い`);
  }

  if (
    viewer.portrait.location &&
    target.portrait.location &&
    viewer.portrait.location === target.portrait.location
  ) {
    points.push(`活動エリアが${viewer.portrait.location}で近い`);
  }

  const viewerParts = toStringArray(viewer.lookingFor.parts);
  const targetInstruments = toStringArray(target.music.instruments);
  if (
    viewerParts.length &&
    targetInstruments.length &&
    viewerParts.some((part) =>
      targetInstruments.some(
        (instrument) =>
          instrument.toLowerCase().includes(part.toLowerCase()) ||
          part.toLowerCase().includes(instrument.toLowerCase())
      )
    )
  ) {
    points.push("募集パートと演奏パートが合う");
  }

  return [...new Set(points)].slice(0, 4);
}

function buildAiResonanceComment(
  viewer: Member,
  target: Member,
  commonPoints: string[]
): string {
  const sharedGenres = intersection(viewer.music.genres, target.music.genres);
  if (sharedGenres.length >= 2) {
    return `${sharedGenres[0]}と${sharedGenres[1]}への向き合い方が近く、一緒にバンド活動を続けられそうです。`;
  }

  if (sharedGenres.length) {
    return `${sharedGenres[0]}への熱量が近く、無理のない距離感でバンド活動を始められそうです。`;
  }

  const sharedStyle = intersection(
    getInfluencesByPrefix(viewer, "スタイル"),
    getInfluencesByPrefix(target, "スタイル")
  );
  if (sharedStyle.length) {
    return `${sharedStyle[0]}という活動スタイルが重なり、長く続けやすい相性です。`;
  }

  if (commonPoints.length >= 2) {
    return `${commonPoints[0]}。${commonPoints[1]}。音楽を続ける相性が良さそうです。`;
  }

  if (commonPoints.length === 1) {
    return `${commonPoints[0]}。バンド活動のリズムが自然に合いそうです。`;
  }

  return "音楽への向き合い方が近く、一緒に続けられそうな距離感です。";
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
  const sharedStyle = intersection(
    getInfluencesByPrefix(viewer, "スタイル"),
    getInfluencesByPrefix(target, "スタイル")
  );

  if (sharedArtists.length) {
    starters.push(
      `${sharedArtists[0]}の曲で、最近ハマっているものはありますか？`
    );
  }

  if (sharedGenres.length) {
    starters.push(`${sharedGenres[0]}系の音楽、どんなバンドをやってみたいですか？`);
  }

  if (sharedStyle.length) {
    starters.push(`${sharedStyle[0]}、どんな活動から始めたいですか？`);
  }

  const fallbacks = [
    "どんなバンドをやってみたいですか？",
    "ライブはどのくらいの頻度でやりたいですか？",
    "バンドで一番大切にしたいことは何ですか？",
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
