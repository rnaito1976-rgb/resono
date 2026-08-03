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
  /(会話では|話している|会話の中|会話の途中|話をした|話していた|話題にな|語っていた|やり取り|本人の言葉|名前が何度も|会話の温度|空気感|世界観|きっと|音を重ね|ジャンルの壁|時間になりそう|という印象|タイプ|空気だった|饒舌|編集された自己紹介|具体例を|物語|響く|余韻|壁を越える|向き合い方|解像度|輪郭|佇まい|内側への|詩的|エッセイ|温度が|温度を|芯が|筆頭|信条|偏り|地図|判断の|隣で鳴らす|一緒に組む|同じスタジオ|同じバンド|演奏の|言葉の精度|人柄が|自然に湧|距離感です|イメージが)/u;

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
  facts: MemberFacts,
  seed: string,
  avoid?: ImpressionFocus
): FocusCandidate {
  if (candidates.length === 0) {
    const hero =
      facts.instrument && facts.artist
        ? `${facts.instrument}で${facts.artist}`
        : facts.artist ??
          facts.coverLabel ??
          facts.gear ??
          facts.liveMemory ??
          facts.instrument ??
          facts.genre ??
          "音楽";
    return { focus: "music-taste", hero };
  }

  const pool = avoid
    ? candidates.filter((item) => item.focus !== avoid)
    : candidates;

  return pickStable(pool.length > 0 ? pool : candidates, `${seed}:candidate`) ?? candidates[0]!;
}

type TemplateContext = {
  hero: string;
  seed: string;
  facts: MemberFacts;
  member: Member;
};

type ImpressionTemplate = (ctx: TemplateContext) => string;

const IMPRESSION_TEMPLATES: Record<ImpressionFocus, ImpressionTemplate[]> = {
  "music-taste": [
    ({ hero, facts, seed }) => {
      const part = facts.instrument ? `${facts.instrument}やってて、` : "";
      return (
        pickStable(
          [
            `${part}${hero}好き。プレイリストだいたいそれ`,
            `${part}${hero}推し。曲の話になると止まらなさそう`,
            `${hero}と${facts.genreDuo ?? facts.genre ?? "好きな曲"}あたり。好みははっきりしてる`,
            `${hero}の話、結構する人。ライブも行ってそう`,
          ],
          `${seed}:taste`
        ) ?? `${part}${hero}好き`
      );
    },
  ],
  "favorite-song": [
    ({ hero, seed }) =>
      pickStable(
        [
          `${hero}の話になると急に詳しくなる`,
          `${hero}——最近もずっと聴いてるらしい`,
          `${hero}が好きすぎる。カラオケでも出てきそう`,
          `${hero}から入るタイプ。曲名出したら話広がる`,
        ],
        `${seed}:favorite`
      ) ?? `${hero}が好き`,
    ({ hero, facts }) =>
      `${hero}が原点。${facts.instrument ? `${facts.instrument}の` : ""}参考曲にもなってそう`,
  ],
  "play-song": [
    ({ hero, seed }) =>
      pickStable(
        [
          `バンドで${hero}やりたがってる`,
          `コピー候補は${hero}が第一希望`,
          `${hero}、リハで一度通したいタイプ`,
          `${hero}を前にするとテンション上がりそう`,
        ],
        `${seed}:play`
      ) ?? `${hero}をコピーしたい`,
    ({ hero, facts }) =>
      `${hero}を鳴らしたい。${facts.instrument ? `${facts.instrument}パート` : "パート"}は要相談`,
  ],
  "band-stance": [
    ({ hero, seed }) =>
      pickStable(
        [
          `${hero}みたいなバンドやりたいらしい`,
          `目指してるのは${hero}。メンバー募集中`,
          `${hero}——バンドの方向性はここ`,
          `${hero}で活動したい。スタジオは割り勘派`,
        ],
        `${seed}:band`
      ) ?? `${hero}をやりたい`,
    ({ hero, facts }) =>
      `${hero}。${facts.commitment ? `活動ペースは${facts.commitment}` : "活動ペースは要ヒアリング"}`,
  ],
  "live-memory": [
    ({ hero, seed }) =>
      pickStable(
        [
          `${hero}のライブ行ってた。まだ話題に出る`,
          `${hero}——忘れられないライブらしい`,
          `最近${hero}の話してた。客席で見てたタイプ`,
          `${hero}の余計な話はしない。行った事実がデカい`,
        ],
        `${seed}:live`
      ) ?? `${hero}のライブ経験あり`,
  ],
  gear: [
    ({ hero, seed }) =>
      pickStable(
        [
          `${hero}にこだわってる。機材の話は長くなりそう`,
          `愛用は${hero}。音色の話になると急に詳しい`,
          `${hero}メイン。買い替え話も出てきそう`,
          `${hero}——機材選びはここ`,
        ],
        `${seed}:gear`
      ) ?? `${hero}使ってる`,
    ({ hero, facts }) =>
      `${hero}推し。${facts.playingStyle ? `演奏は${facts.playingStyle}寄り` : "サウンド作りにうるさい"}`,
  ],
  "memorable-line": [
    ({ hero, seed }) =>
      pickStable(
        [
          `「${hero}」って言ってた。それがだいたいこの人`,
          `「${hero}」——これだけ覚えとけばだいたい合う`,
          `「${hero}」が忘れられない。短いけどはっきりしてる`,
        ],
        `${seed}:line`
      ) ?? `「${hero}」が印象的`,
  ],
  values: [
    ({ hero, seed }) =>
      pickStable(
        [
          `${hero}を大事にしてる。スタジオもライブもそれ優先`,
          `${hero}——活動のルールはここ`,
          `${hero}が口癖。バンド探しもそれ基準`,
          `${hero}。割と譲らない。相性見るならここ`,
        ],
        `${seed}:values`
      ) ?? `${hero}を大事にしてる`,
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
      "話してみたい",
      "ちょい話しかけやすそう",
      "一度リハ入ってみたい",
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
  return fitLength(
    template({
      hero: ctx.candidate.hero,
      seed: ctx.seed,
      facts: ctx.facts,
      member: ctx.member,
    }),
    ctx.seed
  );
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
  const candidate = pickFocusCandidate(candidates, facts, seed, avoid);

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

/** 会話由来の具体情報から About 向け紹介文（80〜100字）を生成。小説調ではなく、音楽友達がラフに紹介する文体。 */
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
