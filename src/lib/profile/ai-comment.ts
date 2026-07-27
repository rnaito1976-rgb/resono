import { getProfileItems } from "@/lib/profile/items";
import { BAND_VALUE_OPTIONS, VALUE_OPTIONS } from "@/lib/resonance/dialogue";
import type { Member } from "@/types/member";
import type { ProfileItemKind } from "@/types/profile-item";

const MIN_LENGTH = 100;
const MAX_LENGTH = 120;

const PART_ATMOSPHERE: Record<string, string> = {
  ボーカル: "声の温度",
  ギター: "弦の余韻",
  ベース: "低域の支え",
  ドラム: "ビートの芯",
  キーボード: "鍵盤の広がり",
  シンセ: "音の空間",
  DJ: "場の温度づくり",
  管楽器: "息の抜け",
};

const GENRE_AIR: Record<string, string> = {
  ロック: "歪みと熱",
  UKロック: "切れ味のあるリズム",
  ポップ: "メロディの軽やかさ",
  インディー: "等身大の音",
  ジャズ: "即興の余白",
  "R&B": "グルーヴの深み",
  ヒップホップ: "言葉とビート",
  エレクトロ: "デジタルの質感",
  フォーク: "素朴な響き",
  メタル: "重厚な圧",
  パンク: "直進するエネルギー",
  シティポップ: "夜のきらめき",
  ソウル: "体温のある音",
  ブルース: "ブルースの揺れ",
  レゲエ: "ゆるやかなグルーヴ",
  アンビエント: "静かな広がり",
};

type IntroSignals = {
  values: string[];
  energy: string[];
  ideal: string[];
  whispers: string[];
  scene?: string;
  process?: string;
  dream?: string;
  now?: string;
  partTone?: string;
  genreAir?: string;
  commitment?: string;
};

function stableIndex(seed: string, length: number): number {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return length > 0 ? hash % length : 0;
}

function pickStable<T>(items: T[], seed: string): T | undefined {
  if (items.length === 0) {
    return undefined;
  }

  return items[stableIndex(seed, items.length)];
}

function cleanPhrase(text: string): string {
  return text
    .replace(/[。！!？?\s]+$/u, "")
    .replace(/(です|ます|でした|ました|している|しています|が好きです|が好き|をしています|をしている)$/u, "")
    .trim();
}

function clipPhrase(text: string, maxLength: number): string {
  const cleaned = cleanPhrase(text);
  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  const slice = cleaned.slice(0, maxLength);
  const breakAt = Math.max(slice.lastIndexOf("、"), slice.lastIndexOf("。"));
  if (breakAt > maxLength * 0.5) {
    return slice.slice(0, breakAt).trim();
  }

  return slice.trim();
}

function uniqueSentences(parts: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of parts) {
    const sentence = part.trim();
    if (!sentence || seen.has(sentence)) {
      continue;
    }

    seen.add(sentence);
    result.push(sentence);
  }

  return result;
}

function extractInfluenceValues(member: Member): string[] {
  const values: string[] = [];

  for (const influence of member.portrait.influences) {
    if (influence.startsWith("大切:")) {
      const value = cleanPhrase(influence.slice(3));
      if (value) {
        values.push(value);
      }
    }
  }

  const options = new Set<string>([...VALUE_OPTIONS, ...BAND_VALUE_OPTIONS]);
  for (const tag of member.tags) {
    if (options.has(tag)) {
      values.push(tag);
    }
  }

  return [...new Set(values)];
}

function extractProfileEssence(member: Member, kinds: ProfileItemKind[]): string | undefined {
  for (const kind of kinds) {
    const item = getProfileItems(member).find((entry) => entry.kind === kind);
    const text = item?.value.trim();
    if (text) {
      return clipPhrase(text, 20);
    }
  }

  return undefined;
}

function reframeCommitment(text: string): string | undefined {
  const cleaned = cleanPhrase(text);
  if (!cleaned) {
    return undefined;
  }

  if (/週|月|回|ライブ|練習/.test(cleaned)) {
    return clipPhrase(`スタジオペースは${cleaned}くらい`, 22);
  }

  return clipPhrase(cleaned, 20);
}

function collectIntroSignals(member: Member): IntroSignals {
  const signals = member.portrait.resonanceSignals;

  const values = [
    ...extractInfluenceValues(member),
    ...(signals?.bandValues ?? []),
  ].map(cleanPhrase).filter(Boolean);

  const energy = [
    ...(signals?.musicFocus ?? []),
    ...(signals?.conversation ?? []),
  ].map(cleanPhrase).filter(Boolean);

  const ideal = (signals?.idealMember ?? []).map(cleanPhrase).filter(Boolean);

  const whispers = [
    member.portrait.bio,
    member.lookingFor.bandVision,
    ...(signals?.notes ?? []),
  ]
    .map((text) => cleanPhrase(text))
    .filter(Boolean);

  const part = member.music.instruments.find(Boolean);
  const genre = member.music.genres.find(Boolean);

  return {
    values: [...new Set(values)],
    energy: [...new Set(energy)],
    ideal: [...new Set(ideal)],
    whispers: [...new Set(whispers)],
    scene: extractProfileEssence(member, ["live-ritual", "favorite-live"]),
    process: extractProfileEssence(member, ["creative-process"]),
    dream: extractProfileEssence(member, ["dream-band"]),
    now: extractProfileEssence(member, ["current-obsession"]),
    partTone: part ? PART_ATMOSPHERE[part] : undefined,
    genreAir: genre && GENRE_AIR[genre] ? GENRE_AIR[genre] : undefined,
    commitment: member.lookingFor.commitment
      ? reframeCommitment(member.lookingFor.commitment)
      : undefined,
  };
}

function buildSeed(member: Member, signals: IntroSignals): string {
  return [
    member.id,
    member.name,
    ...signals.values,
    ...signals.energy,
    signals.scene ?? "",
    signals.process ?? "",
    signals.dream ?? "",
    signals.now ?? "",
  ].join("|");
}

function buildTraitPool(signals: IntroSignals): string[] {
  return [
    ...signals.whispers.map((text) => clipPhrase(text, 28)),
    ...signals.ideal.map((text) => clipPhrase(text, 22)),
    ...signals.values.map((text) => `${text}を忘れないタイプ`),
    ...signals.energy.map((text) => clipPhrase(text, 22)),
    signals.process ? `${clipPhrase(signals.process, 14)}から形を見つける` : undefined,
    signals.scene ? `${clipPhrase(signals.scene, 14)}で心を整える` : undefined,
    signals.dream ? clipPhrase(signals.dream, 22) : undefined,
    signals.now ? `今は${clipPhrase(signals.now, 16)}に傾いてる` : undefined,
    signals.partTone ? `${signals.partTone}が自然に前に出る` : undefined,
    signals.genreAir ? `${signals.genreAir}が混ざった空気` : undefined,
    signals.commitment,
  ].filter((item): item is string => Boolean(item));
}

function studioHooks(): string[] {
  return [
    "スタジオで場の空気が整うタイプ",
    "「今度一緒に鳴らそう」って言いやすい",
    "リハ室で顔合わせしたくなる温度",
    "一緒に音を重ねると噛み合いやすい",
    "セッションの空気を温めてくれる",
    "初対面でもテンポが合いやすい",
  ];
}

function closingLines(): string[] {
  return [
    "知らないうちに「次もやろう」になる",
    "音で距離が縮まるタイプ",
    "余白の使い方がプロっぽい",
    "その日の体温を大切にしてる",
    "音楽の話で目の色が変わる",
    "静かだけど、芯がある",
  ];
}

function violatesStyle(text: string): boolean {
  return /(です|ます|が好き|をしている|をしています|プロフィール)/u.test(text);
}

function joinWithinLimit(sentences: string[]): string {
  let result = "";

  for (const sentence of sentences) {
    const next = result ? `${result}${sentence}。` : `${sentence}。`;
    if (next.length > MAX_LENGTH) {
      break;
    }
    result = next;
  }

  return result;
}

function finalizeLength(sentences: string[], seed: string): string {
  const extensionPool = [...studioHooks(), ...closingLines()];

  let parts = uniqueSentences(sentences);
  let result = joinWithinLimit(parts);

  if (result.length >= MIN_LENGTH) {
    return result;
  }

  let extensionIndex = 0;

  while (result.length < MIN_LENGTH && extensionIndex < extensionPool.length) {
    const extension =
      extensionPool[(stableIndex(seed, extensionPool.length) + extensionIndex) % extensionPool.length];

    if (!parts.includes(extension)) {
      parts = [...parts, extension];
      result = joinWithinLimit(parts);
    }

    extensionIndex += 1;
  }

  return result;
}

function composeIntro(signals: IntroSignals, member: Member): string {
  const seed = buildSeed(member, signals);
  const traits = buildTraitPool(signals);
  const traitA = pickStable(traits, `${seed}:a`) ?? "音を重ねる時間を大切にする";
  const traitB =
    pickStable(
      traits.filter((item) => item !== traitA),
      `${seed}:b`
    ) ?? pickStable(
      [
        signals.commitment,
        signals.partTone ? `${signals.partTone}で場の輪郭がはっきりする` : undefined,
        signals.process ? `${signals.process}からアイデアが立ち上がる` : undefined,
      ].filter((item): item is string => Boolean(item)),
      `${seed}:b2`
    );

  const hook = pickStable(studioHooks(), `${seed}:hook`) ?? studioHooks()[0];
  const close = pickStable(closingLines(), `${seed}:close`) ?? closingLines()[0];

  const structures = [
    [traitA, hook, close],
    [`知り合いの音楽好きから聞いた話だけど、${clipPhrase(traitA, 22)}らしい`, hook],
    [traitA, hook],
    [
      pickStable(signals.values, `${seed}:value`)
        ? `${pickStable(signals.values, `${seed}:value`)}を大事にする人`
        : traitA,
      close,
    ],
    [signals.dream ? `${clipPhrase(signals.dream, 20)}をイメージに音を組む` : traitA, hook],
    [
      signals.scene ?? signals.now
        ? `${clipPhrase((signals.scene ?? signals.now)!, 18)}あたりの音楽性`
        : traitA,
      close,
    ],
    [
      pickStable(signals.ideal, `${seed}:ideal`)
        ? `${clipPhrase(pickStable(signals.ideal, `${seed}:ideal`)!, 18)}に近い空気`
        : traitA,
      hook,
    ],
    [signals.commitment ?? traitA, close],
    [traitA, traitB, hook],
  ];

  const chosen =
    structures[stableIndex(`${seed}:structure`, structures.length)] ?? structures[0];

  let text = finalizeLength(
    chosen.filter((item): item is string => Boolean(item)),
    seed
  );

  if (violatesStyle(text)) {
    text = finalizeLength([traitA, hook], `${seed}:safe`);
  }

  return text;
}

/** プロフィール内容から About 向け AI 紹介文（100〜120字）を生成 */
export function buildProfileAiComment(member: Member): string {
  const signals = collectIntroSignals(member);
  return composeIntro(signals, member);
}

export function applyProfileAiComment(member: Member): Member {
  return {
    ...member,
    aiComment: buildProfileAiComment(member),
  };
}
