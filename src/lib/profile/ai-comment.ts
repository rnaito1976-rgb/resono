import { parseArtistSongLine } from "@/lib/form";
import { getProfileItems } from "@/lib/profile/items";
import type { Member } from "@/types/member";
import type { ProfileItemKind } from "@/types/profile-item";

const MIN_LENGTH = 80;
const MAX_LENGTH = 100;

/** 表示しない。紹介文の軸になる第一印象。 */
type FirstImpression =
  | "studio-lover"
  | "live-first"
  | "quiet-tune"
  | "copy-starter"
  | "wide-taste"
  | "improv-spirit";

type AnchorKind =
  | "live-memory"
  | "ritual-song"
  | "obsession"
  | "process"
  | "dream"
  | "album"
  | "hero"
  | "gear"
  | "artist"
  | "cover-song";

type ConversationAnchor = {
  kind: AnchorKind;
  label: string;
  title?: string;
  artist?: string;
};

type IntroContext = {
  seed: string;
  member: Member;
  impression: FirstImpression;
  anchors: ConversationAnchor[];
};

type IntroWriter = (ctx: IntroContext, anchor: ConversationAnchor) => string | null;

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
    .replace(/(です|ます|でした|ました|している|しています)$/u, "")
    .trim();
}

function clip(text: string, max: number): string {
  const cleaned = cleanPhrase(text);
  if (cleaned.length <= max) {
    return cleaned;
  }

  const slice = cleaned.slice(0, max);
  const breakAt = Math.max(slice.lastIndexOf("、"), slice.lastIndexOf(" "));
  if (breakAt > max * 0.45) {
    return slice.slice(0, breakAt).trim();
  }

  return slice.trim();
}

function isBannedPhrase(text: string): boolean {
  return /(です|ます|が好き|大切に|探して|をしている|をしています|プロフィール|担当)/u.test(
    text
  );
}

function normalizeArtistSong(raw: string): { artist?: string; title: string } {
  const parsed = parseArtistSongLine(raw);
  return {
    artist: parsed.artist ? clip(parsed.artist, 16) : undefined,
    title: clip(parsed.title, 20),
  };
}

function pushAnchor(
  anchors: ConversationAnchor[],
  seen: Set<string>,
  anchor: ConversationAnchor
) {
  const key = `${anchor.kind}:${anchor.label}`;
  if (!anchor.label || seen.has(key)) {
    return;
  }

  seen.add(key);
  anchors.push(anchor);
}

function collectConversationAnchors(member: Member): ConversationAnchor[] {
  const anchors: ConversationAnchor[] = [];
  const seen = new Set<string>();

  const itemPriority: ProfileItemKind[] = [
    "live-ritual",
    "favorite-live",
    "current-obsession",
    "first-album",
    "guitar-heroes",
    "creative-process",
    "dream-band",
    "favorite-gear",
    "music-dna",
  ];

  for (const kind of itemPriority) {
    const item = getProfileItems(member).find((entry) => entry.kind === kind);
    if (!item?.value.trim()) {
      continue;
    }

    const value = cleanPhrase(item.value);
    const detail = item.detail ? cleanPhrase(item.detail) : undefined;

    switch (kind) {
      case "live-ritual": {
        const song = normalizeArtistSong(value);
        pushAnchor(anchors, seen, {
          kind: "ritual-song",
          label: song.artist ? `${song.artist}の${song.title}` : song.title,
          artist: song.artist,
          title: song.title,
        });
        break;
      }
      case "favorite-live":
        pushAnchor(anchors, seen, { kind: "live-memory", label: clip(value, 28) });
        break;
      case "current-obsession":
        pushAnchor(anchors, seen, { kind: "obsession", label: clip(value, 22) });
        break;
      case "first-album":
        pushAnchor(anchors, seen, { kind: "album", label: clip(value, 20) });
        break;
      case "guitar-heroes":
        pushAnchor(anchors, seen, {
          kind: "hero",
          label: clip(value, 18),
          artist: clip(value, 18),
        });
        break;
      case "creative-process":
        pushAnchor(anchors, seen, { kind: "process", label: clip(value, 24) });
        break;
      case "dream-band":
        pushAnchor(anchors, seen, { kind: "dream", label: clip(value, 24) });
        break;
      case "favorite-gear":
        pushAnchor(anchors, seen, {
          kind: "gear",
          label: detail ? `${clip(value, 14)}（${clip(detail, 10)}）` : clip(value, 20),
        });
        break;
      case "music-dna":
        for (const line of value.split("\n").map(cleanPhrase).filter(Boolean).slice(0, 2)) {
          pushAnchor(anchors, seen, {
            kind: "artist",
            label: clip(line, 16),
            artist: clip(line, 16),
          });
        }
        break;
      default:
        break;
    }
  }

  for (const artist of member.music.favoriteArtists.filter(Boolean).slice(0, 4)) {
    pushAnchor(anchors, seen, {
      kind: "artist",
      label: clip(artist, 16),
      artist: clip(artist, 16),
    });
  }

  for (const cover of member.music.coverSongs ?? []) {
    const artist = cover.artist?.trim();
    const title = cover.title?.trim();
    if (!title) {
      continue;
    }

    pushAnchor(anchors, seen, {
      kind: "cover-song",
      label: artist ? `${clip(artist, 14)}の${clip(title, 16)}` : clip(title, 20),
      artist: artist ? clip(artist, 14) : undefined,
      title: clip(title, 16),
    });
  }

  return anchors;
}

function inferFirstImpression(member: Member): FirstImpression {
  const signals = member.portrait.resonanceSignals;
  const blob = [
    ...(signals?.musicFocus ?? []),
    ...(signals?.conversation ?? []),
    member.lookingFor.bandVision,
    member.lookingFor.commitment,
  ]
    .filter(Boolean)
    .join(" ");

  if (/コピー|セッションから|コピーバンド/.test(blob)) {
    return "copy-starter";
  }

  if (/練習重視|スタジオ|制作/.test(blob)) {
    return "studio-lover";
  }

  if (/ライブハウス|定期的に演奏|ライブ/.test(blob)) {
    return "live-first";
  }

  if (/ゆっくり|沈黙|静|内省/.test(blob)) {
    return "quiet-tune";
  }

  if (/即興|自由|テンポよく/.test(blob)) {
    return "improv-spirit";
  }

  if (member.music.genres.length >= 3) {
    return "wide-taste";
  }

  return "studio-lover";
}

function pickPrimaryAnchor(
  anchors: ConversationAnchor[],
  seed: string
): ConversationAnchor | undefined {
  if (anchors.length === 0) {
    return undefined;
  }

  const tiers: AnchorKind[][] = [
    ["live-memory", "ritual-song", "cover-song"],
    ["obsession", "process", "hero", "album"],
    ["dream", "gear"],
    ["artist"],
  ];

  for (const tier of tiers) {
    const pool = anchors.filter((item) => tier.includes(item.kind));
    if (pool.length > 0) {
      return pickStable(pool, `${seed}:anchor`);
    }
  }

  return pickStable(anchors, `${seed}:anchor`);
}

function joinArtistNames(anchors: ConversationAnchor[], limit = 2): string | undefined {
  const names = anchors
    .filter((item) => item.kind === "artist" || item.kind === "hero")
    .map((item) => item.label)
    .filter(Boolean);

  const unique = [...new Set(names)].slice(0, limit);
  if (unique.length >= 2) {
    return `${unique[0]}と${unique[1]}`;
  }

  if (unique.length === 1) {
    return unique[0];
  }

  return undefined;
}

const MOOD_VARIANTS: Record<FirstImpression, string[]> = {
  "quiet-tune": [
    "静かな曲の話になると、急に饒舌になる空気だった",
    "穏やかなメロディの話題で、声のトーンが柔らかくなった",
  ],
  "copy-starter": [
    "譜面より、その場のノリで音を合わせたい、と言っていた",
    "コピーではなく、一緒に鳴らす時間を想像していた",
  ],
  "improv-spirit": [
    "即興の話になると、急に前のめりになる空気だった",
    "アドリブの話題で、目の色が一気に変わった",
  ],
  "live-first": [
    "ライブの話になると、急に目の色が変わる空気だった",
    "会場の熱の話で、声のトーンが上がっていった",
  ],
  "wide-taste": [
    "曲の話題が次々と広がっていく、そんな会話だった",
    "ジャンルの壁を越えて、音の話が続いていった",
  ],
  "studio-lover": [
    "音の話になると、急に饒舌になる空気だった",
    "リハ前に曲の話をすると、急に集中モードに入る",
  ],
};

const CLOSING_VARIANTS = [
  "次は一緒にスタジオで音を重ねてみたい",
  "一緒に音を重ねたら、きっと面白い時間になりそう",
  "スタジオで顔合わせして、一度鳴らしてみたい",
  "次は一緒にリハして、空気を確かめてみたい",
  "一緒にスタジオに入ったら、きっと楽しい時間になりそう",
];

function moodClause(ctx: IntroContext, avoid?: RegExp): string {
  const variants = MOOD_VARIANTS[ctx.impression].filter((line) => !avoid?.test(line));
  const pool = variants.length > 0 ? variants : MOOD_VARIANTS[ctx.impression];
  return pickStable(pool, `${ctx.seed}:mood`) ?? pool[0];
}

function closingClause(ctx: IntroContext): string {
  return pickStable(CLOSING_VARIANTS, `${ctx.seed}:close`) ?? CLOSING_VARIANTS[0];
}

const LENGTH_PADS = [
  "、その話の余韻が少し残った",
  "、会話の温度が伝わってきた",
];

function fitLength(body: string, ctx: IntroContext): string {
  let text = cleanPhrase(body);

  if (!text.endsWith("。")) {
    text = `${text}。`;
  }

  if (text.length < MIN_LENGTH) {
    const close = closingClause(ctx);
    if (!text.includes(close)) {
      const next = `${text}${close}。`;
      if (next.length <= MAX_LENGTH) {
        text = next;
      }
    }
  }

  if (text.length < MIN_LENGTH) {
    const parts = text.replace(/。$/u, "").split("。");
    if (parts.length >= 2) {
      const pad = pickStable(LENGTH_PADS, `${ctx.seed}:pad`) ?? LENGTH_PADS[0];
      parts[parts.length - 2] = `${parts[parts.length - 2]}${pad}`;
      const next = `${parts.join("。")}。`;
      if (next.length >= MIN_LENGTH && next.length <= MAX_LENGTH) {
        text = next;
      }
    }
  }

  if (text.length > MAX_LENGTH) {
    text = `${clip(text, MAX_LENGTH - 1)}。`;
  }

  return text;
}

function buildArtistDuoIntro(ctx: IntroContext, duo: string): string {
  const mood = moodClause(ctx);
  const close = closingClause(ctx);
  const openings = [
    `会話が${duo}のあいだを行き来した`,
    `途中、${duo}の名前が何度も出てきた`,
    `${duo}の話題で一気に距離が縮まった`,
    `この前の会話、${duo}の話が止まらなかった`,
  ];
  const opening = pickStable(openings, `${ctx.seed}:artist-open`) ?? openings[0];
  return `${opening}。${mood}。${close}`;
}

function buildSingleArtistIntro(ctx: IntroContext, label: string): string {
  const mood = moodClause(ctx);
  const close = closingClause(ctx);

  if (ctx.impression === "copy-starter") {
    const openings = [
      `${label}のコピー話で盛り上がった`,
      `${label}を一緒に鳴らす話で、目の色が変わった`,
    ];
    const opening = pickStable(openings, `${ctx.seed}:copy-open`) ?? openings[0];
    return `${opening}。譜面より、その場のノリで音を合わせたい。${close}`;
  }

  const openings = [
    `${label}の話題で一気に距離が縮まった`,
    `${label}の名前が出た瞬間、急に饒舌になった`,
    `会話の途中、${label}の話が長く続いた`,
  ];
  const opening = pickStable(openings, `${ctx.seed}:single-open`) ?? openings[0];
  return `${opening}。${mood}。${close}`;
}

const INTRO_WRITERS: IntroWriter[] = [
  (ctx, anchor) => {
    if (anchor.kind !== "live-memory") {
      return null;
    }

    const openings = [
      `${anchor.label}の話になったとき、急に表情が変わった`,
      `${anchor.label}の余韻が、会話の途中にも残っていた`,
    ];
    const opening = pickStable(openings, `${ctx.seed}:live-open`) ?? openings[0];
    return `${opening}。${moodClause(ctx)}。${closingClause(ctx)}`;
  },
  (ctx, anchor) => {
    if (anchor.kind !== "ritual-song") {
      return null;
    }

    const lead =
      ctx.impression === "quiet-tune"
        ? `${anchor.label}を流してからスタジオに入る、と話していた`
        : `リハ前に${anchor.label}をかける話で盛り上がった`;

    return `${lead}。${moodClause(ctx, /リハ前/)}。${closingClause(ctx)}`;
  },
  (ctx, anchor) => {
    if (anchor.kind !== "cover-song") {
      return null;
    }

    if (ctx.impression === "copy-starter") {
      return `${anchor.label}のコピー話で盛り上がった。譜面より、その場のノリで音を合わせたい。${closingClause(ctx)}`;
    }

    return `${anchor.label}の話題で一気に距離が縮まった。${moodClause(ctx)}。${closingClause(ctx)}`;
  },
  (ctx, anchor) => {
    if (anchor.kind !== "obsession") {
      return null;
    }

    return `最近${anchor.label}の話ばかり。スタジオに入ると、急に集中モードに入る。${closingClause(ctx)}`;
  },
  (ctx, anchor) => {
    if (anchor.kind !== "process") {
      return null;
    }

    return `${anchor.label}。アイデアの立ち上げ方が、ちょっと面白い。${closingClause(ctx)}`;
  },
  (ctx, anchor) => {
    if (anchor.kind !== "hero" && anchor.kind !== "album") {
      return null;
    }

    const openings = [
      `${anchor.label}の話で止まらなかった`,
      `${anchor.label}の名前が出た瞬間、急に饒舌になった`,
    ];
    const opening = pickStable(openings, `${ctx.seed}:hero-open`) ?? openings[0];
    return `${opening}。${moodClause(ctx)}。${closingClause(ctx)}`;
  },
  (ctx, anchor) => {
    if (anchor.kind !== "dream") {
      return null;
    }

    return `${anchor.label}のバンド像を語っていた。${moodClause(ctx)}。一緒に形にしてみたい`;
  },
  (ctx, anchor) => {
    if (anchor.kind !== "gear") {
      return null;
    }

    return `${anchor.label}の音で場が締まる、と話していた。${moodClause(ctx)}。${closingClause(ctx)}`;
  },
  (ctx, anchor) => {
    if (anchor.kind !== "artist") {
      return null;
    }

    const duo = joinArtistNames(ctx.anchors);
    if (duo && duo.includes("と")) {
      return buildArtistDuoIntro(ctx, duo);
    }

    return buildSingleArtistIntro(ctx, anchor.label);
  },
];

function composeSparseIntro(ctx: IntroContext): string {
  const duo = joinArtistNames(ctx.anchors);
  if (duo && duo.includes("と")) {
    return buildArtistDuoIntro(ctx, duo);
  }

  const tempo = ctx.member.portrait.resonanceSignals?.conversation?.[0];
  if (tempo && /即興|自由/.test(tempo)) {
    return `即興の話になると、急に前のめりになる空気だった。${closingClause(ctx)}`;
  }

  return `音楽の話をすると、急に饒舌になる空気だった。${closingClause(ctx)}`;
}

function composeIntro(ctx: IntroContext): string {
  const anchor = pickPrimaryAnchor(ctx.anchors, ctx.seed);
  const candidates: string[] = [];

  if (anchor) {
    const start = stableIndex(`${ctx.seed}:writer`, INTRO_WRITERS.length);
    for (let offset = 0; offset < INTRO_WRITERS.length; offset += 1) {
      const draft = INTRO_WRITERS[(start + offset) % INTRO_WRITERS.length](ctx, anchor);
      if (draft && !isBannedPhrase(draft)) {
        candidates.push(draft);
      }
    }
  }

  candidates.push(composeSparseIntro(ctx));

  for (const candidate of candidates) {
    const fitted = fitLength(candidate, ctx);
    if (fitted.length >= MIN_LENGTH && fitted.length <= MAX_LENGTH && !isBannedPhrase(fitted)) {
      return fitted;
    }
  }

  return fitLength(candidates[0] ?? composeSparseIntro(ctx), ctx);
}

/** 会話由来の具体情報から About 向け AI 紹介文（80〜100字）を生成 */
export function buildProfileAiComment(member: Member): string {
  const seed = [
    member.id,
    member.name,
    ...getProfileItems(member).map((item) => `${item.kind}:${item.value}`),
    ...member.music.favoriteArtists,
    ...(member.music.coverSongs ?? []).map((song) => `${song.artist}:${song.title}`),
  ].join("|");

  const ctx: IntroContext = {
    seed,
    member,
    impression: inferFirstImpression(member),
    anchors: collectConversationAnchors(member),
  };

  return composeIntro(ctx);
}

export function applyProfileAiComment(member: Member): Member {
  return {
    ...member,
    aiComment: buildProfileAiComment(member),
  };
}
