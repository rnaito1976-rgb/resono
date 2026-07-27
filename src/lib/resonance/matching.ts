import type { Member } from "@/types/member";
import type { MemberResonanceSignals } from "@/types/resonance-signals";
import type { CoverSong } from "@/types/music-profile";

function toStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const key = normalizeToken(value);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(value.trim());
  }

  return result;
}

function intersection(a: unknown, b: unknown): string[] {
  const left = toStringArray(a);
  const right = toStringArray(b);
  const normalized = new Set(right.map(normalizeToken));

  return left.filter((item) => normalized.has(normalizeToken(item)));
}

function partsMatch(left: string, right: string): boolean {
  const a = normalizeToken(left);
  const b = normalizeToken(right);
  if (!a || !b) {
    return false;
  }

  return a === b || a.includes(b) || b.includes(a);
}

function matchParts(needles: string[], haystack: string[]): string[] {
  return needles.filter((needle) => haystack.some((item) => partsMatch(needle, item)));
}

function overlapFactor(left: string[], right: string[], cap = 3): number {
  if (!left.length || !right.length) {
    return 0;
  }

  return Math.min(1, intersection(left, right).length / Math.min(cap, Math.max(left.length, 1)));
}

function getInfluencesByPrefix(member: Member, prefix: string): string[] {
  return toStringArray(member.portrait.influences)
    .filter((item) => item.startsWith(`${prefix}:`))
    .map((item) => item.slice(prefix.length + 1).trim())
    .filter(Boolean);
}

function getSignals(member: Member): MemberResonanceSignals {
  return member.portrait.resonanceSignals ?? {};
}

/** 公開プロフィール + 対話由来の内部シグナルを統合（内部は表示しない） */
function getMusicFocus(member: Member): string[] {
  return uniqueStrings([
    ...toStringArray(getSignals(member).musicFocus),
    ...toStringArray(member.music.playingStyle),
    ...getInfluencesByPrefix(member, "スタイル"),
  ]);
}

function getBandStyleTokens(member: Member): string[] {
  const vision = member.lookingFor.bandVision.trim();
  const visionTokens = vision
    ? vision
        .split(/[\s、,./|・]+/)
        .map((item) => item.trim())
        .filter((item) => item.length >= 2)
    : [];

  return uniqueStrings([
    ...visionTokens.slice(0, 8),
    ...getInfluencesByPrefix(member, "バンド"),
    ...getInfluencesByPrefix(member, "スタイル"),
    ...toStringArray(getSignals(member).musicFocus),
  ]);
}

function getScheduleTokens(member: Member): string[] {
  const commitment = member.lookingFor.commitment.trim();
  return uniqueStrings([
    ...(commitment ? [commitment] : []),
    ...getInfluencesByPrefix(member, "活動"),
  ]);
}

function getCoverTitles(member: Member): string[] {
  return uniqueStrings(
    toStringArray(member.music.coverSongs?.map((song: CoverSong) => song.title))
  );
}

function getCoverArtists(member: Member): string[] {
  return uniqueStrings(
    toStringArray(member.music.coverSongs?.map((song: CoverSong) => song.artist)).filter(Boolean)
  );
}

function textSoftOverlap(a: string, b: string): number {
  const left = normalizeToken(a);
  const right = normalizeToken(b);
  if (!left || !right) {
    return 0;
  }
  if (left === right) {
    return 1;
  }
  if (left.includes(right) || right.includes(left)) {
    return 0.85;
  }

  const leftParts = left.split(/[\s、,./|・]+/).filter((item) => item.length >= 2);
  const rightParts = right.split(/[\s、,./|・]+/).filter((item) => item.length >= 2);
  if (!leftParts.length || !rightParts.length) {
    return 0;
  }

  const shared = leftParts.filter((part) => rightParts.some((other) => partsMatch(part, other)));
  return Math.min(1, shared.length / Math.min(3, Math.max(leftParts.length, rightParts.length)));
}

/**
 * 「一緒にバンドを組みたい可能性」を重み付けして算出する。
 * 単純なプロフィール一致率ではない。
 */
const WEIGHTS = {
  // ★★★★★
  favoriteArtists: 16,
  wantToCover: 14,
  lookingFor: 14,
  playingParts: 11,
  // ★★★★☆
  genres: 9,
  bandStyle: 8,
  coverOriginal: 7,
  schedule: 6,
  // ★★★☆☆
  studios: 4,
  liveHouses: 4,
  festivals: 4,
  gear: 3,
  // 内部シグナル（プロフィール非表示）
  internalSignals: 8,
} as const;

const WEIGHT_TOTAL = Object.values(WEIGHTS).reduce((sum, value) => sum + value, 0);

function scoreLookingForFit(viewer: Member, target: Member): {
  score: number;
  matchedRecruiting: string[];
  matchedPlaying: string[];
} {
  const viewerLooking = toStringArray(viewer.lookingFor.parts);
  const targetLooking = toStringArray(target.lookingFor.parts);
  const viewerPlaying = toStringArray(viewer.music.instruments);
  const targetPlaying = toStringArray(target.music.instruments);

  const viewerNeedsTarget = matchParts(viewerLooking, targetPlaying);
  const targetNeedsViewer = matchParts(targetLooking, viewerPlaying);

  let score = 0;
  if (viewerNeedsTarget.length) {
    score += Math.min(1, viewerNeedsTarget.length / 2) * 0.55;
  }
  if (targetNeedsViewer.length) {
    score += Math.min(1, targetNeedsViewer.length / 2) * 0.45;
  }

  return {
    score: Math.min(1, score),
    matchedRecruiting: uniqueStrings([...targetNeedsViewer, ...viewerNeedsTarget]),
    matchedPlaying: uniqueStrings([...viewerNeedsTarget, ...targetNeedsViewer]),
  };
}

function scorePartsComplement(viewer: Member, target: Member): number {
  const viewerPlaying = toStringArray(viewer.music.instruments);
  const targetPlaying = toStringArray(target.music.instruments);
  if (!viewerPlaying.length || !targetPlaying.length) {
    return 0;
  }

  const lookingFit = scoreLookingForFit(viewer, target).score;
  const sameParts = matchParts(viewerPlaying, targetPlaying);
  const diversity =
    sameParts.length === 0
      ? 1
      : Math.max(0.25, 1 - sameParts.length / Math.max(viewerPlaying.length, targetPlaying.length));

  return Math.min(1, lookingFit * 0.65 + diversity * 0.35);
}

function scoreWantToCover(viewer: Member, target: Member): {
  score: number;
  sharedTitles: string[];
  sharedBands: string[];
} {
  const sharedTitles = intersection(getCoverTitles(viewer), getCoverTitles(target));
  const sharedBands = intersection(viewer.music.dreamBands, target.music.dreamBands);
  const crossArtist = intersection(
    [...getCoverArtists(viewer), ...toStringArray(viewer.music.dreamBands)],
    [...toStringArray(target.music.favoriteArtists), ...getCoverArtists(target)]
  );
  const reverseCross = intersection(
    [...getCoverArtists(target), ...toStringArray(target.music.dreamBands)],
    [...toStringArray(viewer.music.favoriteArtists), ...getCoverArtists(viewer)]
  );

  const titleFactor = overlapFactor(getCoverTitles(viewer), getCoverTitles(target), 2);
  const bandFactor = overlapFactor(
    toStringArray(viewer.music.dreamBands),
    toStringArray(target.music.dreamBands),
    2
  );
  const crossFactor = Math.min(
    1,
    (crossArtist.length + reverseCross.length) / 3
  );

  return {
    score: Math.min(1, titleFactor * 0.5 + bandFactor * 0.3 + crossFactor * 0.35),
    sharedTitles,
    sharedBands: uniqueStrings([...sharedBands, ...crossArtist.slice(0, 2)]),
  };
}

function scoreInternalSignals(viewer: Member, target: Member): number {
  const left = getSignals(viewer);
  const right = getSignals(target);

  const focus = overlapFactor(
    getMusicFocus(viewer),
    getMusicFocus(target),
    2
  );
  const values = overlapFactor(
    uniqueStrings([
      ...toStringArray(left.bandValues),
      ...getInfluencesByPrefix(viewer, "大切"),
    ]),
    uniqueStrings([
      ...toStringArray(right.bandValues),
      ...getInfluencesByPrefix(target, "大切"),
    ]),
    2
  );
  const ideal = overlapFactor(
    uniqueStrings([
      ...toStringArray(left.idealMember),
      ...getInfluencesByPrefix(viewer, "メンバー"),
    ]),
    uniqueStrings([
      ...toStringArray(right.idealMember),
      ...getInfluencesByPrefix(target, "メンバー"),
    ]),
    2
  );
  const conversation = overlapFactor(
    uniqueStrings([
      ...toStringArray(left.conversation),
      ...getInfluencesByPrefix(viewer, "会話"),
    ]),
    uniqueStrings([
      ...toStringArray(right.conversation),
      ...getInfluencesByPrefix(target, "会話"),
    ]),
    1
  );
  const notes = overlapFactor(
    toStringArray(left.notes),
    toStringArray(right.notes),
    2
  );

  return Math.min(1, focus * 0.25 + values * 0.3 + ideal * 0.25 + conversation * 0.1 + notes * 0.1);
}

function collectFactorScores(viewer: Member, target: Member) {
  const artists = overlapFactor(
    toStringArray(viewer.music.favoriteArtists),
    toStringArray(target.music.favoriteArtists),
    3
  );
  const cover = scoreWantToCover(viewer, target);
  const looking = scoreLookingForFit(viewer, target);
  const parts = scorePartsComplement(viewer, target);
  const genres = overlapFactor(
    toStringArray(viewer.music.genres),
    toStringArray(target.music.genres),
    3
  );
  const bandStyle = Math.max(
    overlapFactor(getBandStyleTokens(viewer), getBandStyleTokens(target), 3),
    textSoftOverlap(viewer.lookingFor.bandVision, target.lookingFor.bandVision)
  );
  const coverOriginal = overlapFactor(getMusicFocus(viewer), getMusicFocus(target), 2);
  const schedule = Math.max(
    overlapFactor(getScheduleTokens(viewer), getScheduleTokens(target), 2),
    textSoftOverlap(viewer.lookingFor.commitment, target.lookingFor.commitment)
  );
  const studios = overlapFactor(
    toStringArray(viewer.music.favoriteStudios),
    toStringArray(target.music.favoriteStudios),
    2
  );
  const liveHouses = overlapFactor(
    toStringArray(viewer.music.favoriteLiveHouses),
    toStringArray(target.music.favoriteLiveHouses),
    2
  );
  const festivals = overlapFactor(
    toStringArray(viewer.music.favoriteFestivals),
    toStringArray(target.music.favoriteFestivals),
    2
  );
  const gear = overlapFactor(
    toStringArray(viewer.music.gear),
    toStringArray(target.music.gear),
    2
  );
  const internal = scoreInternalSignals(viewer, target);

  return {
    artists,
    cover,
    looking,
    parts,
    genres,
    bandStyle,
    coverOriginal,
    schedule,
    studios,
    liveHouses,
    festivals,
    gear,
    internal,
  };
}

export function calculateResonanceMatch(viewer: Member, target: Member): number {
  if (viewer.id === target.id) {
    return 100;
  }

  const factors = collectFactorScores(viewer, target);
  const weighted =
    factors.artists * WEIGHTS.favoriteArtists +
    factors.cover.score * WEIGHTS.wantToCover +
    factors.looking.score * WEIGHTS.lookingFor +
    factors.parts * WEIGHTS.playingParts +
    factors.genres * WEIGHTS.genres +
    factors.bandStyle * WEIGHTS.bandStyle +
    factors.coverOriginal * WEIGHTS.coverOriginal +
    factors.schedule * WEIGHTS.schedule +
    factors.studios * WEIGHTS.studios +
    factors.liveHouses * WEIGHTS.liveHouses +
    factors.festivals * WEIGHTS.festivals +
    factors.gear * WEIGHTS.gear +
    factors.internal * WEIGHTS.internalSignals;

  const ratio = weighted / WEIGHT_TOTAL;
  // ベースを置きつつ、バンド適合の重みで押し上げる
  const score = 32 + ratio * 67;

  return Math.min(99, Math.max(38, Math.round(score)));
}

export type ResonanceReason = {
  score: number;
  commonPoints: string[];
  aiComment: string;
  /** キャッシュ無効化用。ロジック変更時に上げる */
  version?: number;
};

export const RESONANCE_ALGORITHM_VERSION = 2;

export function isCurrentResonanceReason(
  reason: ResonanceReason | undefined
): reason is ResonanceReason {
  return (
    reason != null &&
    Number.isFinite(reason.score) &&
    reason.version === RESONANCE_ALGORITHM_VERSION
  );
}

function collectCommonPoints(viewer: Member, target: Member): string[] {
  const points: string[] = [];
  const factors = collectFactorScores(viewer, target);

  for (const artist of intersection(
    viewer.music.favoriteArtists,
    target.music.favoriteArtists
  ).slice(0, 2)) {
    points.push(`${artist}が好き`);
  }

  for (const title of factors.cover.sharedTitles.slice(0, 2)) {
    points.push(`${title}をコピーしたい`);
  }

  for (const band of factors.cover.sharedBands.slice(0, 1)) {
    if (!points.some((point) => point.includes(band))) {
      points.push(`${band}をコピーしたい`);
    }
  }

  for (const part of factors.looking.matchedRecruiting.slice(0, 2)) {
    points.push(`${part}募集中`);
  }

  const viewerPlaying = toStringArray(viewer.music.instruments);
  const targetPlaying = toStringArray(target.music.instruments);
  if (viewerPlaying.length && targetPlaying.length) {
    const complementary = targetPlaying.filter(
      (part) => !viewerPlaying.some((own) => partsMatch(own, part))
    );
    if (complementary.length && points.length < 6) {
      points.push(`${complementary[0]}担当`);
    }
  }

  for (const genre of intersection(viewer.music.genres, target.music.genres).slice(0, 2)) {
    points.push(genre);
  }

  const sharedFocus = intersection(getMusicFocus(viewer), getMusicFocus(target));
  for (const focus of sharedFocus.slice(0, 1)) {
    points.push(focus);
  }

  const sharedSchedule = intersection(getScheduleTokens(viewer), getScheduleTokens(target));
  for (const schedule of sharedSchedule.slice(0, 1)) {
    points.push(schedule);
  }

  for (const studio of intersection(
    viewer.music.favoriteStudios,
    target.music.favoriteStudios
  ).slice(0, 1)) {
    points.push(studio);
  }

  for (const liveHouse of intersection(
    viewer.music.favoriteLiveHouses,
    target.music.favoriteLiveHouses
  ).slice(0, 1)) {
    points.push(liveHouse);
  }

  for (const festival of intersection(
    viewer.music.favoriteFestivals,
    target.music.favoriteFestivals
  ).slice(0, 1)) {
    points.push(festival);
  }

  for (const item of intersection(viewer.music.gear, target.music.gear).slice(0, 1)) {
    points.push(item);
  }

  if (viewer.lookingFor.bandVision.trim() && factors.bandStyle >= 0.45) {
    const vision = target.lookingFor.bandVision.trim();
    if (vision) {
      const short = vision.length > 22 ? `${vision.slice(0, 22)}…` : vision;
      if (!points.includes(short)) {
        points.push(short);
      }
    }
  }

  return uniqueStrings(points).slice(0, 6);
}

function buildAiResonanceComment(
  viewer: Member,
  target: Member,
  commonPoints: string[],
  score: number
): string {
  if (score >= 85 && commonPoints.length >= 2) {
    return `${commonPoints[0]}。${commonPoints[1]}。一緒にバンドを組むイメージが自然に湧きます。`;
  }

  if (commonPoints.length >= 2) {
    return `${commonPoints[0]}と${commonPoints[1]}が重なり、バンドとしての相性が良さそうです。`;
  }

  if (commonPoints.length === 1) {
    return `${commonPoints[0]}。活動のリズムを合わせやすそうです。`;
  }

  const looking = scoreLookingForFit(viewer, target);
  if (looking.score > 0) {
    return "募集パートと演奏パートが噛み合い、編成として組みやすそうです。";
  }

  return "音楽への向き合い方が近く、一緒に続けられそうな距離感です。";
}

export function buildResonanceReason(
  viewer: Member,
  target: Member
): ResonanceReason {
  const score = calculateResonanceMatch(viewer, target);
  const commonPoints = collectCommonPoints(viewer, target);

  return {
    score,
    commonPoints,
    aiComment: buildAiResonanceComment(viewer, target, commonPoints, score),
    version: RESONANCE_ALGORITHM_VERSION,
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
  const sharedCover = intersection(getCoverTitles(viewer), getCoverTitles(target));
  const sharedFocus = intersection(getMusicFocus(viewer), getMusicFocus(target));

  if (sharedArtists.length) {
    starters.push(
      `${sharedArtists[0]}の曲で、最近ハマっているものはありますか？`
    );
  }

  if (sharedCover.length) {
    starters.push(`『${sharedCover[0]}』、一緒にコピーしてみたいですか？`);
  }

  if (sharedGenres.length) {
    starters.push(`${sharedGenres[0]}系の音楽、どんなバンドをやってみたいですか？`);
  }

  if (sharedFocus.length) {
    starters.push(`${sharedFocus[0]}、どんな活動から始めたいですか？`);
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
