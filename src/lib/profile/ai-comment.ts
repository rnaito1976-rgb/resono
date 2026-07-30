import { parseArtistSongLine } from "@/lib/form";
import { getProfileItems } from "@/lib/profile/items";
import type { Member } from "@/types/member";
import type { ProfileItemKind } from "@/types/profile-item";

const MIN_LENGTH = 80;
const MAX_LENGTH = 100;

/** 印象の主役。表示しない。 */
export type ImpressionFocus =
  | "music-taste"
  | "favorite-song"
  | "play-song"
  | "band-stance"
  | "live-memory"
  | "gear"
  | "memorable-line"
  | "values";

const IMPRESSION_FOCUSES: ImpressionFocus[] = [
  "music-taste",
  "favorite-song",
  "play-song",
  "band-stance",
  "live-memory",
  "gear",
  "memorable-line",
  "values",
];

const BANNED_PATTERN =
  /(会話では|話している|会話の中|会話の途中|話をした|話していた|話題にな|語っていた|やり取り|本人の言葉|名前が何度も|会話の温度|空気感|世界観|きっと|音を重ね|ジャンルの壁|時間になりそう|という印象|タイプ|空気だった|饒舌|編集された自己紹介|具体例を)/u;

export type BuildProfileAiCommentOptions = {
  /** 直前のメンバーと同じ切り口を避ける（一括再生成用） */
  avoidFocus?: ImpressionFocus;
  /** @deprecated Use avoidFocus */
  avoidAngle?: ImpressionFocus;
};

type MemberFacts = {
  artist?: string;
  artistDuo?: string;
  genre?: string;
  genreDuo?: string;
  instrument?: string;
  liveMemory?: string;
  favoriteSong?: string;
  coverSong?: string;
  coverArtist?: string;
  coverLabel?: string;
  obsession?: string;
  gear?: string;
  album?: string;
  hero?: string;
  dream?: string;
  bandVision?: string;
  commitment?: string;
  memorableLine?: string;
  valueNote?: string;
  playingStyle?: string;
};

type FocusCandidate = {
  focus: ImpressionFocus;
  hero: string;
};

type ImpressionContext = {
  seed: string;
  member: Member;
  facts: MemberFacts;
  candidate: FocusCandidate;
  templateIndex: number;
};

/** @deprecated Use ImpressionFocus */
export type IntroAngle = ImpressionFocus;

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

function joinList(items: string[], limit = 2): string | undefined {
  const unique = [...new Set(items.filter(Boolean))].slice(0, limit);
  if (unique.length >= 2) {
    return `${unique[0]}と${unique[1]}`;
  }

  if (unique.length === 1) {
    return unique[0];
  }

  return undefined;
}

function normalizeArtistSong(raw: string): { artist?: string; title: string } {
  const parsed = parseArtistSongLine(raw);
  return {
    artist: parsed.artist ? clip(parsed.artist, 16) : undefined,
    title: clip(parsed.title, 20),
  };
}

function getProfileValue(member: Member, kind: ProfileItemKind): string | undefined {
  const item = getProfileItems(member).find((entry) => entry.kind === kind);
  if (!item?.value.trim()) {
    return undefined;
  }

  return cleanPhrase(item.value);
}

function collectFacts(member: Member): MemberFacts {
  const ritualRaw = getProfileValue(member, "live-ritual");
  const ritual = ritualRaw ? normalizeArtistSong(ritualRaw) : undefined;
  const cover = member.music.coverSongs?.find((song) => song.title?.trim());
  const coverArtist = cover?.artist?.trim();
  const coverTitle = cover?.title?.trim();
  const signals = member.portrait.resonanceSignals;

  const memorableLine = pickStable(
    [
      signals?.notes?.[0],
      signals?.conversation?.[0],
      signals?.idealMember?.[0],
    ]
      .filter(Boolean)
      .map((line) => clip(line!, 22)),
    `${member.id}:line`
  );

  const valueNote = pickStable(
    [
      signals?.bandValues?.[0],
      signals?.musicFocus?.[0],
      member.lookingFor.commitment
        ? clip(member.lookingFor.commitment, 22)
        : undefined,
    ]
      .filter(Boolean)
      .map((line) => clip(line!, 22)),
    `${member.id}:value`
  );

  return {
    artist: member.music.favoriteArtists[0]
      ? clip(member.music.favoriteArtists[0], 16)
      : member.portrait.influences[0]
        ? clip(member.portrait.influences[0], 16)
        : undefined,
    artistDuo: joinList([
      ...member.music.favoriteArtists,
      ...member.portrait.influences,
    ]),
    genre: member.music.genres[0] ? clip(member.music.genres[0], 14) : undefined,
    genreDuo: joinList(member.music.genres),
    instrument: member.music.instruments[0]
      ? clip(member.music.instruments[0], 10)
      : undefined,
    liveMemory: getProfileValue(member, "favorite-live")
      ? clip(getProfileValue(member, "favorite-live")!, 24)
      : undefined,
    favoriteSong: ritual
      ? ritual.artist
        ? `${ritual.artist}の${ritual.title}`
        : ritual.title
      : undefined,
    coverSong: coverTitle ? clip(coverTitle, 18) : undefined,
    coverArtist: coverArtist ? clip(coverArtist, 14) : undefined,
    coverLabel:
      coverTitle && coverArtist
        ? `${clip(coverArtist, 14)}の${clip(coverTitle, 16)}`
        : coverTitle
          ? clip(coverTitle, 18)
          : undefined,
    obsession: getProfileValue(member, "current-obsession")
      ? clip(getProfileValue(member, "current-obsession")!, 20)
      : undefined,
    gear: getProfileValue(member, "favorite-gear")
      ? clip(getProfileValue(member, "favorite-gear")!, 20)
      : undefined,
    album: getProfileValue(member, "first-album")
      ? clip(getProfileValue(member, "first-album")!, 18)
      : undefined,
    hero: getProfileValue(member, "guitar-heroes")
      ? clip(getProfileValue(member, "guitar-heroes")!, 16)
      : undefined,
    dream: getProfileValue(member, "dream-band")
      ? clip(getProfileValue(member, "dream-band")!, 22)
      : undefined,
    bandVision: member.lookingFor.bandVision
      ? clip(member.lookingFor.bandVision, 24)
      : undefined,
    commitment: member.lookingFor.commitment
      ? clip(member.lookingFor.commitment, 22)
      : undefined,
    memorableLine,
    valueNote,
    playingStyle: member.music.playingStyle?.[0]
      ? clip(member.music.playingStyle[0], 14)
      : undefined,
  };
}

function collectFocusCandidates(facts: MemberFacts): FocusCandidate[] {
  const candidates: FocusCandidate[] = [];

  if (facts.artistDuo) {
    candidates.push({ focus: "music-taste", hero: facts.artistDuo });
  } else if (facts.genreDuo) {
    candidates.push({ focus: "music-taste", hero: facts.genreDuo });
  } else if (facts.obsession) {
    candidates.push({ focus: "music-taste", hero: facts.obsession });
  } else if (facts.artist) {
    candidates.push({ focus: "music-taste", hero: facts.artist });
  }

  if (facts.favoriteSong) {
    candidates.push({ focus: "favorite-song", hero: facts.favoriteSong });
  } else if (facts.album) {
    candidates.push({ focus: "favorite-song", hero: facts.album });
  } else if (facts.hero) {
    candidates.push({ focus: "favorite-song", hero: facts.hero });
  }

  if (facts.coverLabel) {
    candidates.push({ focus: "play-song", hero: facts.coverLabel });
  }

  if (facts.bandVision) {
    candidates.push({ focus: "band-stance", hero: facts.bandVision });
  } else if (facts.dream) {
    candidates.push({ focus: "band-stance", hero: facts.dream });
  } else if (facts.commitment) {
    candidates.push({ focus: "band-stance", hero: facts.commitment });
  }

  if (facts.liveMemory) {
    candidates.push({ focus: "live-memory", hero: facts.liveMemory });
  }

  if (facts.gear) {
    candidates.push({ focus: "gear", hero: facts.gear });
  }

  if (facts.memorableLine) {
    candidates.push({ focus: "memorable-line", hero: facts.memorableLine });
  }

  if (facts.valueNote) {
    candidates.push({ focus: "values", hero: facts.valueNote });
  }

  return candidates;
}

function pickFocusCandidate(
  candidates: FocusCandidate[],
  seed: string,
  avoid?: ImpressionFocus
): FocusCandidate {
  if (candidates.length === 0) {
    return { focus: "music-taste", hero: "音楽への向き合い方" };
  }

  const pool = avoid
    ? candidates.filter((item) => item.focus !== avoid)
    : candidates;

  return pickStable(pool.length > 0 ? pool : candidates, `${seed}:candidate`) ?? candidates[0]!;
}

type ImpressionTemplate = (hero: string, seed: string) => string;

const IMPRESSION_TEMPLATES: Record<ImpressionFocus, ImpressionTemplate[]> = {
  "music-taste": [
    (hero, seed) =>
      pickStable(
        [
          `${hero}——この人の音楽地図の中心。一緒に組むと、軸がぶれない`,
          `${hero}が好みの頂点。リハが始まる前から、音の色が見えている`,
          `${hero}への偏りが強い。同じスタジオに入ると、好みの温度が先に立つ`,
          `音楽の芯は${hero}。隣で鳴らすと、その方向性が伝わってくる`,
        ],
        `${seed}:taste`
      ) ?? `音楽の芯は${hero}`,
  ],
  "favorite-song": [
    (hero) => `${hero}を語るとき、目の色が変わる。隣で鳴らすと、その熱が伝わる`,
    (hero) => `${hero}が、この人の音楽の起点。一緒に組むと、芯がはっきりする`,
    (hero, seed) =>
      pickStable(
        [
          `${hero}——忘れられない一曲。同じスタジオで、温度が合いそう`,
          `${hero}の余韻が残った。演奏の輪郭を、一緒に描けそう`,
        ],
        `${seed}:favorite`
      ) ?? `${hero}の余韻が残った`,
  ],
  "play-song": [
    (hero) => `${hero}を鳴らしたい——その想いが残った。譜面より入り方にこだわりがある`,
    (hero) => `${hero}を前にすると、リハの輪郭が見える。隣で鳴らすと、温度が合う`,
    (hero, seed) =>
      pickStable(
        [
          `${hero}——演奏したい曲の筆頭。同じスタジオで、入り方から作れそう`,
          `${hero}が候補の筆頭。一緒に鳴らすと、ノリが先に合いそう`,
        ],
        `${seed}:play`
      ) ?? `${hero}が候補の筆頭`,
  ],
  "band-stance": [
    (hero) => `${hero}——バンドへの向き合い方がはっきりしている`,
    (hero) => `目指しているのは${hero}。一緒に組むと、その芯がぶれない`,
    (hero, seed) =>
      pickStable(
        [
          `${hero}がバンドの芯。同じリハ室に入ると、方向が見える`,
          `${hero}——この人のバンド観の中心。隣で鳴らすと、解像度が上がる`,
        ],
        `${seed}:band`
      ) ?? `${hero}がバンドの芯`,
  ],
  "live-memory": [
    (hero) => `${hero}の余韻が残った。ライブの熱が、まだ消えていない`,
    (hero) => `${hero}——忘れられないライブ。同じステージに立つと、温度が合いそう`,
    (hero, seed) =>
      pickStable(
        [
          `${hero}が原点。一緒に鳴らすと、ライブへの向き合い方が伝わる`,
          `${hero}の記憶が強い。隣で演奏すると、会場の熱が思い出される`,
        ],
        `${seed}:live`
      ) ?? `${hero}の記憶が強い`,
  ],
  gear: [
    (hero) => `${hero}へのこだわりが強い。隣で鳴らすと、音作りの精度が伝わる`,
    (hero) => `${hero}——機材選びに時間をかけている。同じスタジオで、音色が合いそう`,
    (hero, seed) =>
      pickStable(
        [
          `${hero}が音の芯。一緒に組むと、機材の解像度が先に分かる`,
          `${hero}への愛が強い。リハが始まる前から、音色の方向が見える`,
        ],
        `${seed}:gear`
      ) ?? `${hero}が音の芯`,
  ],
  "memorable-line": [
    (hero) => `「${hero}」——その一言が残った。一緒に鳴らすと、言葉の精度が伝わる`,
    (hero) => `「${hero}」が忘れられない。隣で演奏すると、人柄がはっきりする`,
    (hero, seed) =>
      pickStable(
        [
          `「${hero}」——短い一言に、音楽への向き合い方が詰まっている`,
          `「${hero}」が残った。同じバンドに入ると、その価値観が芯になる`,
        ],
        `${seed}:line`
      ) ?? `「${hero}」が残った`,
  ],
  values: [
    (hero) =>
      `${hero}を大切にする人。バンドに入ると、その価値観が芯になる`,
    (hero) =>
      `${hero}——この人の軸。一緒に鳴らすと、判断の輪郭が見える`,
    (hero, seed) =>
      pickStable(
        [
          `${hero}が信条。同じスタジオに入ると、大切にしたいことが伝わる`,
          `${hero}——価値観の中心。隣で演奏すると、バンドの芯が見える`,
        ],
        `${seed}:values`
      ) ?? `${hero}が信条`,
  ],
};

function isValidImpression(text: string): boolean {
  if (!text || BANNED_PATTERN.test(text)) {
    return false;
  }

  return !/(です|ます|プロフィール|担当)/u.test(text);
}

function fitLength(text: string, seed: string): string {
  let body = cleanPhrase(text);

  if (!body.endsWith("。")) {
    body = `${body}。`;
  }

  if (body.length > MAX_LENGTH) {
    return `${clip(body, MAX_LENGTH - 1)}。`;
  }

  if (body.length >= MIN_LENGTH) {
    return body;
  }

  const sentenceCount = body.split("。").filter(Boolean).length;
  if (sentenceCount >= 2) {
    return body;
  }

  const pad = pickStable(
    [
      "同じバンドに入りたくなる",
      "リハの温度が自然と想像できる",
      "隣で鳴らすと温度が合う",
    ],
    `${seed}:pad`
  );

  if (!pad) {
    return body;
  }

  const padded = `${body}${pad}。`;
  if (padded.length <= MAX_LENGTH) {
    return padded;
  }

  return body;
}

function composeImpression(ctx: ImpressionContext): string {
  const templates = IMPRESSION_TEMPLATES[ctx.candidate.focus];
  const index = (ctx.templateIndex + stableIndex(ctx.seed, templates.length)) % templates.length;
  const template = templates[index] ?? templates[0]!;
  return fitLength(template(ctx.candidate.hero, ctx.seed), ctx.seed);
}

function buildSeed(member: Member): string {
  return [
    member.id,
    member.name,
    ...getProfileItems(member).map((item) => `${item.kind}:${item.value}`),
    ...member.music.favoriteArtists,
    ...(member.music.coverSongs ?? []).map((song) => `${song.artist}:${song.title}`),
    member.lookingFor.bandVision,
    member.music.listeningMood ?? "",
  ].join("|");
}

export function resolveProfileAiIntro(
  member: Member,
  options?: BuildProfileAiCommentOptions
): { angle: ImpressionFocus; comment: string } {
  const seed = buildSeed(member);
  const facts = collectFacts(member);
  const avoid = options?.avoidFocus ?? options?.avoidAngle;
  const candidates = collectFocusCandidates(facts);
  const candidate = pickFocusCandidate(candidates, seed, avoid);

  const attempts: Array<{ focus: ImpressionFocus; comment: string }> = [];

  for (let offset = 0; offset < IMPRESSION_FOCUSES.length; offset += 1) {
    const focus =
      IMPRESSION_FOCUSES[
        (IMPRESSION_FOCUSES.indexOf(candidate.focus) + offset) % IMPRESSION_FOCUSES.length
      ]!;
    const focusedCandidate =
      candidates.find((item) => item.focus === focus) ??
      (offset === 0 ? candidate : undefined);

    if (!focusedCandidate) {
      continue;
    }

    for (let templateOffset = 0; templateOffset < 3; templateOffset += 1) {
      const text = composeImpression({
        seed,
        member,
        facts,
        candidate: focusedCandidate,
        templateIndex: templateOffset,
      });

      if (isValidImpression(text) && text.length >= MIN_LENGTH && text.length <= MAX_LENGTH) {
        attempts.push({ focus: focusedCandidate.focus, comment: text });
      }
    }
  }

  for (const attempt of attempts) {
    return { angle: attempt.focus, comment: attempt.comment };
  }

  const fallback = composeImpression({
    seed,
    member,
    facts,
    candidate,
    templateIndex: 0,
  });

  return {
    angle: candidate.focus,
    comment: fallback,
  };
}

/** 会話由来の具体情報から About 向け AI 印象文（80〜100字）を生成 */
export function buildProfileAiComment(
  member: Member,
  options?: BuildProfileAiCommentOptions
): string {
  return resolveProfileAiIntro(member, options).comment;
}

export function applyProfileAiComment(member: Member): Member {
  return {
    ...member,
    aiComment: buildProfileAiComment(member),
  };
}
