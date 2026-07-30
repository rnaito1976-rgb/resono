import { parseArtistSongLine } from "@/lib/form";
import { getProfileItems } from "@/lib/profile/items";
import type { Member } from "@/types/member";
import type { ProfileItemKind } from "@/types/profile-item";

const MIN_LENGTH = 80;
const MAX_LENGTH = 100;

/** 紹介の切り口。表示しない。 */
export type IntroAngle =
  | "conversation-memory"
  | "music-relationship"
  | "favorite-band-trend"
  | "playing-style"
  | "band-role"
  | "studio-habit"
  | "live-enjoyment"
  | "gear-focus"
  | "music-discovery"
  | "personality"
  | "band-purpose"
  | "cover-song"
  | "favorite-genre"
  | "non-music-values"
  | "conversation-tempo";

/** 文章構成。表示しない。 */
type IntroStructure =
  | "single"
  | "two-part"
  | "short"
  | "episode-first"
  | "song-first"
  | "impression-first"
  | "question-first"
  | "surprise-first";

const INTRO_ANGLES: IntroAngle[] = [
  "conversation-memory",
  "music-relationship",
  "favorite-band-trend",
  "playing-style",
  "band-role",
  "studio-habit",
  "live-enjoyment",
  "gear-focus",
  "music-discovery",
  "personality",
  "band-purpose",
  "cover-song",
  "favorite-genre",
  "non-music-values",
  "conversation-tempo",
];

const INTRO_STRUCTURES: IntroStructure[] = [
  "single",
  "two-part",
  "short",
  "episode-first",
  "song-first",
  "impression-first",
  "question-first",
  "surprise-first",
];

const BANNED_PATTERN =
  /(会話の温度|空気感|世界観|きっと|音を重ね|ジャンルの壁|時間になりそう|という印象|タイプ|空気だった|饒舌になる|一気に距離|共鳴する|似合う人)/u;

type MemberFacts = {
  artist?: string;
  artistDuo?: string;
  genre?: string;
  genreDuo?: string;
  instrument?: string;
  instrumentDuo?: string;
  liveMemory?: string;
  ritualSong?: string;
  coverSong?: string;
  coverArtist?: string;
  obsession?: string;
  gear?: string;
  album?: string;
  hero?: string;
  process?: string;
  dream?: string;
  bandVision?: string;
  commitment?: string;
  listeningMood?: string;
  conversationNote?: string;
  fashionNote?: string;
  location?: string;
  playingStyle?: string;
  part?: string;
};

type IntroContext = {
  seed: string;
  member: Member;
  angle: IntroAngle;
  structure: IntroStructure;
  facts: MemberFacts;
};

export type BuildProfileAiCommentOptions = {
  /** 直前のメンバーと同じ切り口を避ける（一括再生成用） */
  avoidAngle?: IntroAngle;
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

function formatListeningLead(mood: string): string {
  const trimmed = cleanPhrase(mood);
  if (/に聴く|を聴く|聴く/u.test(trimmed)) {
    return `音楽時間は${trimmed}`;
  }

  return `音楽は${trimmed}に聴く`;
}

function formatListeningFollow(mood: string): string {
  const trimmed = cleanPhrase(mood);
  if (/に聴く|を聴く|聴く/u.test(trimmed)) {
    return `「${trimmed}」が定番、と言っていた`;
  }

  return `音楽は${trimmed}に聴く、と言っていた`;
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
    instrumentDuo: joinList(member.music.instruments),
    liveMemory: getProfileValue(member, "favorite-live")
      ? clip(getProfileValue(member, "favorite-live")!, 24)
      : undefined,
    ritualSong: ritual
      ? ritual.artist
        ? `${ritual.artist}の${ritual.title}`
        : ritual.title
      : undefined,
    coverSong: coverTitle ? clip(coverTitle, 18) : undefined,
    coverArtist: coverArtist ? clip(coverArtist, 14) : undefined,
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
    process: getProfileValue(member, "creative-process")
      ? clip(getProfileValue(member, "creative-process")!, 22)
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
    listeningMood: member.music.listeningMood
      ? clip(member.music.listeningMood, 22)
      : undefined,
    conversationNote: member.portrait.resonanceSignals?.conversation?.[0]
      ? clip(member.portrait.resonanceSignals.conversation[0], 18)
      : undefined,
    fashionNote: member.fashion.description
      ? clip(member.fashion.description, 20)
      : undefined,
    location: member.portrait.location
      ? clip(member.portrait.location, 8)
      : undefined,
    playingStyle: member.music.playingStyle?.[0]
      ? clip(member.music.playingStyle[0], 14)
      : undefined,
    part: member.lookingFor.parts[0]
      ? clip(member.lookingFor.parts[0], 8)
      : undefined,
  };
}

function pickAngle(seed: string, avoid?: IntroAngle): IntroAngle {
  let index = stableIndex(`${seed}:angle`, INTRO_ANGLES.length);

  if (avoid && INTRO_ANGLES[index] === avoid) {
    index = (index + 1) % INTRO_ANGLES.length;
  }

  return INTRO_ANGLES[index]!;
}

function pickStructure(seed: string): IntroStructure {
  return INTRO_STRUCTURES[stableIndex(`${seed}:structure`, INTRO_STRUCTURES.length)]!;
}

function isValidIntro(text: string): boolean {
  if (!text || BANNED_PATTERN.test(text)) {
    return false;
  }

  return !/(です|ます|が好き|大切に|探して|をしている|をしています|プロフィール|担当)/u.test(
    text
  );
}

function fitLength(text: string, seed: string): string {
  let body = cleanPhrase(text);

  if (!body.endsWith("。")) {
    body = `${body}。`;
  }

  if (body.length > MAX_LENGTH) {
    body = `${clip(body, MAX_LENGTH - 1)}。`;
  }

  if (body.length < MIN_LENGTH) {
    const pad = pickStable(LENGTH_PADS, `${seed}:pad`) ?? LENGTH_PADS[0];
    const next = `${body.replace(/。$/u, "")}${pad}。`;
    if (next.length <= MAX_LENGTH) {
      body = next;
    }
  }

  if (body.length > MAX_LENGTH) {
    body = `${clip(body, MAX_LENGTH - 1)}。`;
  }

  return body;
}

function applyStructure(
  structure: IntroStructure,
  lead: string,
  follow?: string,
  seed?: string
): string {
  const second = follow?.trim();

  switch (structure) {
    case "single":
      return lead;
    case "two-part":
      return second ? `${lead}。${second}` : lead;
    case "short":
      return second ? `${lead}、${second}` : lead;
    case "episode-first":
      return second
        ? `会話の途中、${lead}。${second}`
        : `会話の途中、${lead}`;
    case "song-first": {
      const songLead = pickStable(
        [
          lead,
          second ? `『${lead}』の話から始まった。${second}` : `『${lead}』の話から始まった`,
        ],
        `${seed}:song`
      );
      return songLead ?? lead;
    }
    case "impression-first":
      return second ? `最初に感じたのは、${lead}。${second}` : `最初に感じたのは、${lead}`;
    case "question-first":
      return second ? `${lead}？${second}` : `${lead}？`;
    case "surprise-first":
      return second ? `意外だったのは、${lead}。${second}` : `意外だったのは、${lead}`;
    default:
      return second ? `${lead}。${second}` : lead;
  }
}

type AngleDraft = {
  lead: string;
  follow?: string;
};

function buildAngleDraft(ctx: IntroContext): AngleDraft | null {
  const { angle, facts, member } = ctx;
  const name = member.name;

  switch (angle) {
    case "conversation-memory": {
      if (facts.liveMemory) {
        return {
          lead: `${facts.liveMemory}の話をした`,
          follow: "そのあと少し黙って、また別の話題に戻ってきた",
        };
      }
      if (facts.artist) {
        return {
          lead: `${facts.artist}の話をしたあと、自分の曲の話まで踏み込んできた`,
        };
      }
      return {
        lead: `${name}さんと話しているうちに、音楽以外の話も自然に混ざってきた`,
      };
    }
    case "music-relationship": {
      if (facts.listeningMood) {
        return {
          lead: formatListeningLead(facts.listeningMood),
          follow: "生活のリズムとセットで語る人だった",
        };
      }
      if (facts.process) {
        return { lead: facts.process, follow: "作り方の話が長かった" };
      }
      return {
        lead: "曲を聴く時間より、鳴らす時間の話のほうが多かった",
      };
    }
    case "favorite-band-trend": {
      if (facts.artistDuo) {
        return {
          lead: `${facts.artistDuo}の名前が何度も出てきた`,
          follow: "好きな理由まで細かく語っていた",
        };
      }
      if (facts.artist) {
        return {
          lead: `${facts.artist}の話が中心だった`,
          follow: "他のアーティストの話題にもすぐ広がった",
        };
      }
      return null;
    }
    case "playing-style": {
      if (facts.playingStyle && facts.instrument) {
        return {
          lead: `${facts.instrument}は${facts.playingStyle}寄り`,
          follow: "音作りの話が具体的だった",
        };
      }
      if (facts.instrumentDuo) {
        return {
          lead: `${facts.instrumentDuo}を使い分ける`,
          follow: "役割の話まで自分から出してきた",
        };
      }
      if (facts.instrument) {
        return { lead: `${facts.instrument}の話になると、説明が丁寧になる` };
      }
      return null;
    }
    case "band-role": {
      if (facts.instrument && facts.part) {
        return {
          lead: `${facts.instrument}を担当し、${facts.part}を探している`,
          follow: "編成の話が早かった",
        };
      }
      if (facts.instrument) {
        return {
          lead: `${facts.instrument}の立ち位置を大事にしたい`,
          follow: "役割分担の話がはっきりしていた",
        };
      }
      return {
        lead: "バンドの中で自分が何を担うか、すでに考えている",
      };
    }
    case "studio-habit": {
      if (facts.ritualSong) {
        return {
          lead: `スタジオ前に${facts.ritualSong}をかける`,
          follow: "入り方まで決まっている",
        };
      }
      if (facts.commitment) {
        return {
          lead: `活動は${facts.commitment}`,
          follow: "スタジオの過ごし方まで具体的だった",
        };
      }
      return {
        lead: "リハに入る前から、今日やることを頭の中で整理している",
      };
    }
    case "live-enjoyment": {
      if (facts.liveMemory) {
        return {
          lead: `${facts.liveMemory}が忘れられない`,
          follow: "ライブの話になると声が上がる",
        };
      }
      if (facts.ritualSong) {
        return {
          lead: `ライブ前は${facts.ritualSong}から入る`,
          follow: "会場に出る前の儀式まで話していた",
        };
      }
      return {
        lead: "ライブの話題だけ、会話の速度が変わった",
      };
    }
    case "gear-focus": {
      if (facts.gear) {
        return {
          lead: `${facts.gear}の話が長かった`,
          follow: "音の出し方までこだわりが見えた",
        };
      }
      if (facts.instrument) {
        return {
          lead: `${facts.instrument}の機材選びに時間をかけている`,
        };
      }
      return null;
    }
    case "music-discovery": {
      if (facts.album) {
        return {
          lead: `最初に買ったのは${facts.album}`,
          follow: "その話から今の好みまでつながった",
        };
      }
      if (facts.obsession) {
        return {
          lead: `最近は${facts.obsession}に入っている`,
          follow: "新しい音との出会い方が自分なりだった",
        };
      }
      if (facts.hero) {
        return {
          lead: `${facts.hero}から音楽に入った`,
          follow: "影響の話が意外と長かった",
        };
      }
      return null;
    }
    case "personality": {
      if (facts.fashionNote) {
        return {
          lead: facts.fashionNote,
          follow: "話し方もそれに近かった",
        };
      }
      if (facts.conversationNote) {
        return {
          lead: facts.conversationNote,
          follow: "そのまま会話の進み方にも出ていた",
        };
      }
      return {
        lead: "言葉数は多くないのに、話したことは残る",
      };
    }
    case "band-purpose": {
      if (facts.dream) {
        return { lead: facts.dream, follow: "理想像まで具体的だった" };
      }
      if (facts.bandVision) {
        return {
          lead: "バンドの話になると、言葉が増える",
          follow: facts.bandVision,
        };
      }
      return {
        lead: "バンドに何を求めるか、最初から言葉にできていた",
      };
    }
    case "cover-song": {
      if (facts.coverSong && facts.coverArtist) {
        return {
          lead: `${facts.coverArtist}の${facts.coverSong}`,
          follow: "コピーしたい理由まで話していた",
        };
      }
      if (facts.coverSong) {
        return {
          lead: `『${facts.coverSong}』を一緒に鳴らしたい`,
          follow: "譜面より入り方の話が長かった",
        };
      }
      return {
        lead: "コピー曲の候補を、すでにいくつか持っている",
      };
    }
    case "favorite-genre": {
      if (facts.genreDuo) {
        return {
          lead: `${facts.genreDuo}の話が長かった`,
          follow: "系譜の話まで自分から広げてきた",
        };
      }
      if (facts.genre) {
        return {
          lead: `${facts.genre}の話が多かった`,
          follow: "その系譜まで自分から掘ってきた",
        };
      }
      return null;
    }
    case "non-music-values": {
      if (facts.fashionNote) {
        return {
          lead: facts.fashionNote,
          follow: "音楽以外の話題でもテンポが落ちなかった",
        };
      }
      if (facts.location) {
        return {
          lead: `${facts.location}を拠点に活動している`,
          follow: "生活の話も自然に混ざっていた",
        };
      }
      return {
        lead: "音楽の話の前後で、日常の話もちゃんと続いていた",
      };
    }
    case "conversation-tempo": {
      if (facts.conversationNote) {
        return {
          lead: facts.conversationNote,
          follow: "会話の間の取り方が印象的だった",
        };
      }
      return {
        lead: "質問を返す前に、一度考えてから答える",
        follow: "その分、言葉の精度が高かった",
      };
    }
    default:
      return null;
  }
}

function buildFallbackDraft(ctx: IntroContext): AngleDraft {
  const { facts, member } = ctx;

  if (facts.coverSong && facts.coverArtist) {
    return {
      lead: `${facts.coverArtist}の${facts.coverSong}を一緒に鳴らしたい`,
      follow: "譜面より入り方の話が長かった",
    };
  }

  if (facts.playingStyle && facts.instrument) {
    return {
      lead: `${facts.instrument}は${facts.playingStyle}寄り`,
      follow: "音作りの話が具体的だった",
    };
  }

  if (facts.listeningMood) {
    return {
      lead: formatListeningLead(facts.listeningMood),
      follow: "生活のリズムとセットで語っていた",
    };
  }

  if (facts.artistDuo) {
    return {
      lead: `${facts.artistDuo}の名前が何度も出てきた`,
      follow: "好きな理由まで細かく語っていた",
    };
  }

  if (facts.bandVision) {
    return {
      lead: "バンドの話になると、言葉が増える",
      follow: facts.bandVision,
    };
  }

  if (facts.artist) {
    return {
      lead: `${facts.artist}の話から入った`,
      follow: "そのあと自分の音楽の話まで自然に広がった",
    };
  }

  return {
    lead: `${member.name}さんと話すと、音楽の輪郭が少しずつ見えてくる`,
  };
}

const LENGTH_PADS = [
  "、その話をもう少し聞きたくなった",
  "、次に会ったら続きを聞きたい",
  "、会話の途中でメモしたくなった",
  "、本人の言葉がそのまま残っている",
  "、話の順番が変わっても筋が通っていた",
  "、音楽の話に自然につながっていた",
  "、細部まで覚えている様子だった",
  "、自分から具体例を出してきた",
];

function enrichShortDraft(ctx: IntroContext, draft: AngleDraft): AngleDraft {
  if (draft.follow) {
    return draft;
  }

  const { facts } = ctx;
  const extras = [
    facts.coverSong && facts.coverArtist
      ? `${facts.coverArtist}の${facts.coverSong}を一緒に鳴らしたい、と言っていた`
      : undefined,
    facts.artist ? `${facts.artist}の話も途中で出てきた` : undefined,
    facts.listeningMood ? formatListeningFollow(facts.listeningMood) : undefined,
    facts.instrument ? `${facts.instrument}の話が中心だった` : undefined,
    facts.genre ? `${facts.genre}の話が長かった` : undefined,
    facts.commitment ? `活動ペースは${facts.commitment}` : undefined,
  ].filter((value): value is string => Boolean(value));

  const follow = pickStable(extras, `${ctx.seed}:enrich`);
  if (follow) {
    return { ...draft, follow };
  }

  return draft;
}

function composeIntro(ctx: IntroContext): string {
  const baseDraft = buildAngleDraft(ctx) ?? buildFallbackDraft(ctx);
  const draft = enrichShortDraft(ctx, baseDraft);
  let structure = ctx.structure;

  const singlePreview = applyStructure("single", draft.lead, undefined, ctx.seed);
  if (singlePreview.length < MIN_LENGTH && draft.follow) {
    structure =
      pickStable(
        ["two-part", "episode-first", "impression-first", "surprise-first"],
        `${ctx.seed}:expand`
      ) ?? "two-part";
  }

  const raw = applyStructure(structure, draft.lead, draft.follow, ctx.seed);
  return fitLength(raw, ctx.seed);
}

function createIntroContext(
  member: Member,
  options?: BuildProfileAiCommentOptions
): IntroContext {
  const seed = buildSeed(member);

  return {
    seed,
    member,
    angle: pickAngle(seed, options?.avoidAngle),
    structure: pickStructure(seed),
    facts: collectFacts(member),
  };
}

export function resolveProfileAiIntro(
  member: Member,
  options?: BuildProfileAiCommentOptions
): { angle: IntroAngle; comment: string } {
  const ctx = createIntroContext(member, options);

  const candidates: Array<{ angle: IntroAngle; comment: string }> = [];

  for (let offset = 0; offset < INTRO_ANGLES.length; offset += 1) {
    const tryAngle =
      INTRO_ANGLES[(INTRO_ANGLES.indexOf(ctx.angle) + offset) % INTRO_ANGLES.length]!;
    const tryStructure =
      INTRO_STRUCTURES[
        (INTRO_STRUCTURES.indexOf(ctx.structure) + offset) % INTRO_STRUCTURES.length
      ]!;
    const text = composeIntro({ ...ctx, angle: tryAngle, structure: tryStructure });
    if (isValidIntro(text) && text.length >= MIN_LENGTH && text.length <= MAX_LENGTH) {
      candidates.push({ angle: tryAngle, comment: text });
    }
  }

  const primary = composeIntro(ctx);
  if (isValidIntro(primary)) {
    candidates.unshift({ angle: ctx.angle, comment: primary });
  }

  for (const candidate of candidates) {
    if (candidate.comment.length >= MIN_LENGTH && candidate.comment.length <= MAX_LENGTH) {
      return candidate;
    }
  }

  return {
    angle: ctx.angle,
    comment: fitLength(buildFallbackDraft(ctx).lead, ctx.seed),
  };
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

/** 会話由来の具体情報から About 向け AI 紹介文（80〜100字）を生成 */
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
