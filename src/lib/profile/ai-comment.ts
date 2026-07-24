import { getProfileItems } from "@/lib/profile/items";
import { BAND_VALUE_OPTIONS, VALUE_OPTIONS } from "@/lib/resonance/dialogue";
import type { Member } from "@/types/member";

type ProfileSignals = {
  artist: string;
  secondArtist?: string;
  value?: string;
  part?: string;
  genre?: string;
  fragment?: string;
  mood?: string;
};

const MOOD_BY_KEYWORD: { pattern: RegExp; mood: string }[] = [
  { pattern: /静|落ち着|穏|内省|余白|モノトーン/, mood: "静かな余白" },
  { pattern: /情熱|熱|全力|エネルギ/, mood: "確かな熱" },
  { pattern: /即興|自由|実験|挑戦/, mood: "即興の気配" },
  { pattern: /繊細|透明|美し|深い/, mood: "繊細な輪郭" },
  { pattern: /グルーヴ|ファンク|リズム/, mood: "身体が覚えるリズム" },
];

const PART_HINT: Record<string, string> = {
  ボーカル: "声",
  ギター: "弦",
  ベース: "低域",
  ドラム: "ビート",
  キーボード: "鍵盤",
  シンセ: "音の空間",
  DJ: "場の温度",
  管楽器: "息",
};

function collectProfileText(member: Member): string {
  return [
    member.portrait.bio,
    member.lookingFor.bandVision,
    member.lookingFor.commitment,
    ...member.music.genres,
    ...member.portrait.influences,
    ...getProfileItems(member).flatMap((item) => [item.detail, item.value]),
  ]
    .filter(Boolean)
    .join(" ");
}

function extractArtists(member: Member): string[] {
  const fromMusic = member.music.favoriteArtists.filter(Boolean);
  if (fromMusic.length > 0) {
    return fromMusic;
  }

  const musicDna = getProfileItems(member).find((item) => item.kind === "music-dna");
  const fromDna =
    musicDna?.value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean) ?? [];

  if (fromDna.length > 0) {
    return fromDna;
  }

  return member.tags.filter(Boolean);
}

function extractValue(member: Member): string | undefined {
  for (const influence of member.portrait.influences) {
    if (influence.startsWith("大切:")) {
      const value = influence.slice(3).trim();
      if (value) {
        return value;
      }
    }
  }

  const valueOptions = new Set<string>([...VALUE_OPTIONS, ...BAND_VALUE_OPTIONS]);

  for (const tag of member.tags) {
    if (valueOptions.has(tag)) {
      return tag;
    }
  }

  for (const influence of member.portrait.influences) {
    const trimmed = influence.trim();
    if (trimmed && valueOptions.has(trimmed)) {
      return trimmed;
    }

    if (trimmed && !trimmed.includes(":")) {
      return trimmed;
    }
  }

  return undefined;
}

function extractFragment(member: Member): string | undefined {
  const preferredKinds = [
    "dream-band",
    "creative-process",
    "favorite-live",
    "live-ritual",
    "current-obsession",
  ] as const;

  for (const kind of preferredKinds) {
    const item = getProfileItems(member).find((entry) => entry.kind === kind);
    const text = item?.value.trim();
    if (text) {
      return shorten(text, 18);
    }
  }

  if (member.lookingFor.bandVision.trim()) {
    return shorten(member.lookingFor.bandVision.trim(), 18);
  }

  return undefined;
}

function extractMood(member: Member): string | undefined {
  const profileText = collectProfileText(member);

  for (const { pattern, mood } of MOOD_BY_KEYWORD) {
    if (pattern.test(profileText)) {
      return mood;
    }
  }

  const part = member.music.instruments.find(Boolean);
  if (part && PART_HINT[part]) {
    return `${PART_HINT[part]}の温度`;
  }

  return undefined;
}

function shorten(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}…`;
}

function stableIndex(seed: string, length: number): number {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return hash % length;
}

function collectSignals(member: Member): ProfileSignals {
  const artists = extractArtists(member);

  return {
    artist: artists[0] ?? "音楽",
    secondArtist: artists[1],
    value: extractValue(member),
    part: member.music.instruments.find(Boolean),
    genre: member.music.genres.find(Boolean),
    fragment: extractFragment(member),
    mood: extractMood(member),
  };
}

function composeComment(signals: ProfileSignals, memberId: string): string {
  const { artist, secondArtist, value, part, genre, fragment, mood } = signals;
  const partHint = part ? PART_HINT[part] : undefined;

  const candidates: string[] = [];

  if (fragment && value) {
    candidates.push(`${fragment}。${artist} と ${value}が重なる。`);
  }

  if (secondArtist && mood) {
    candidates.push(`${artist} と ${secondArtist} の間に、${mood}。`);
  }

  if (value && mood) {
    candidates.push(`${artist} の音の向こうに、${value}と${mood}。`);
    candidates.push(`${value}を忘れない。${artist} が近い。`);
  }

  if (partHint && artist) {
    candidates.push(`${artist} を${partHint}で辿る人。`);
  }

  if (genre && artist) {
    candidates.push(`${genre}と ${artist}。${mood ?? "輪郭だけ先に見える"}。`);
  }

  if (fragment) {
    candidates.push(`${fragment}。${artist} が背景にある。`);
  }

  if (value) {
    candidates.push(`${artist}、${value}、${mood ?? "その余白"}。`);
  }

  if (mood) {
    candidates.push(`${artist} の近くに、${mood}がある。`);
  }

  candidates.push(`${artist} あたりの音楽性。${part ? `${part}として` : "少しずつ"}輪郭が見えてくる。`);
  candidates.push(`${artist} の残像が、プロフィールに滲んでいる。`);

  const seed = [
    memberId,
    artist,
    secondArtist ?? "",
    value ?? "",
    part ?? "",
    genre ?? "",
    fragment ?? "",
    mood ?? "",
  ].join("|");

  return candidates[stableIndex(seed, candidates.length)] ?? candidates[0];
}

/** プロフィール内容から AI コメント（名前下の一行）を生成 */
export function buildProfileAiComment(member: Member): string {
  const signals = collectSignals(member);
  return composeComment(signals, member.id);
}

export function applyProfileAiComment(member: Member): Member {
  return {
    ...member,
    aiComment: buildProfileAiComment(member),
  };
}
