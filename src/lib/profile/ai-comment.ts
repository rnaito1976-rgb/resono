import { parseArtistSongLine } from "@/lib/form";
import { getProfileItems } from "@/lib/profile/items";
import type { Member } from "@/types/member";
import type { ProfileItemKind } from "@/types/profile-item";

const MIN_LENGTH = 80;
const MAX_LENGTH = 100;

/** 紹介の切り口。表示しない。 */
export type IntroAngle =
  | "memorable-trait"
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
  | "communication-style";

/** 文章構成。表示しない。 */
type IntroStructure =
  | "single"
  | "two-part"
  | "short"
  | "episode-first"
  | "song-first"
  | "trait-first"
  | "question-first"
  | "surprise-first";

const INTRO_ANGLES: IntroAngle[] = [
  "memorable-trait",
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
  "communication-style",
];

const INTRO_STRUCTURES: IntroStructure[] = [
  "single",
  "two-part",
  "short",
  "episode-first",
  "song-first",
  "trait-first",
  "question-first",
  "surprise-first",
];

const BANNED_PATTERN =
  /(会話|話している|話をした|話していた|話題|語っていた|やり取り|本人の言葉|名前が何度も出てきた|印象的|会話の温度|空気感|世界観|きっと|音を重ね|ジャンルの壁|時間になりそう|という印象|タイプ|空気だった|饒舌|一気に距離|共鳴する|似合う人|と言っていた|話が長|話が中心|話から|話になる|メモした|覚えている様子|具体例を出して)/u;

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
  temperamentNote?: string;
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
    temperamentNote: member.portrait.resonanceSignals?.conversation?.[0]
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

const LENGTH_PADS = [
  "、音の解像度が高い",
  "、こだわりがはっきりしている",
  "、輪郭が少しずつ見えてくる",
  "、自分の言葉で筋が通っている",
  "、編集された自己紹介ではない",
  "、具体性が人柄に出ている",
  "、音楽への向き合い方が一定している",
  "、バンドの形まで見えている",
];

function fitLength(text: string, seed: string): string {
  let body = cleanPhrase(text);

  if (!body.endsWith("。")) {
    body = `${body}。`;
  }

  if (body.length > MAX_LENGTH) {
    body = `${clip(body, MAX_LENGTH - 1)}。`;
  }

  if (body.length >= MIN_LENGTH) {
    return body;
  }

  const pad = pickStable(LENGTH_PADS, `${seed}:pad`) ?? LENGTH_PADS[0];
  const padded = `${body.replace(/。$/u, "")}${pad}。`;
  if (padded.length <= MAX_LENGTH) {
    return padded;
  }

  return body;
}

function buildListeningDraft(facts: MemberFacts, seed: string): AngleDraft {
  const lead = formatListeningLead(facts.listeningMood!);
  const tail = pickStable(
    [
      facts.bandVision ? `目指すのは${facts.bandVision}` : undefined,
      facts.instrument ? `${facts.instrument}も同じリズムで鳴らす` : undefined,
      facts.genre ? `${facts.genre}を軸に、聴く時間も演奏も同じ速度` : undefined,
      "聴く時間も演奏も、日常と同じ速度で動いている",
    ].filter((value): value is string => Boolean(value)),
    `${seed}:listening`
  );

  return tail ? { lead, follow: tail } : { lead };
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
      return second ? `${lead}。${second}` : lead;
    case "song-first": {
      const songLead = pickStable(
        [
          second ? `『${lead}』から${second}` : `『${lead}』が起点`,
          second ? `${lead}を軸に、${second}` : `${lead}を軸に音楽を組み立てる`,
        ],
        `${seed}:song`
      );
      return songLead ?? lead;
    }
    case "trait-first":
      return second ? `${lead}。${second}` : lead;
    case "question-first":
      return second ? `${lead}？${second}` : `${lead}？`;
    case "surprise-first":
      return second ? `意外なのは、${lead}。${second}` : `意外なのは、${lead}`;
    default:
      return second ? `${lead}。${second}` : lead;
  }
}

type AngleDraft = {
  lead: string;
  follow?: string;
};

function buildAngleDraft(ctx: IntroContext): AngleDraft | null {
  const { angle, facts } = ctx;

  switch (angle) {
    case "memorable-trait": {
      if (facts.liveMemory) {
        return {
          lead: `${facts.liveMemory}を原点に音楽を語る`,
          follow: "ライブの記憶が、その人の輪郭になっている",
        };
      }
      if (facts.artist) {
        return {
          lead: `${facts.artist}を入口に、自分の制作まで一本線で結ぶ`,
          follow: "参照と創作の距離感が近い",
        };
      }
      return {
        lead: "音楽と日常を、別々の箱に入れない",
      };
    }
    case "music-relationship": {
      if (facts.listeningMood) {
        return buildListeningDraft(facts, ctx.seed);
      }
      if (facts.process) {
        return { lead: facts.process, follow: "作り方の解像度が高い" };
      }
      return {
        lead: "聴く時間より、鳴らす時間の比重が大きい",
      };
    }
    case "favorite-band-trend": {
      if (facts.artistDuo) {
        return {
          lead: `${facts.artistDuo}を行き来する聴き方`,
          follow: "参照点が多いのに、好みの軸がぶれない",
        };
      }
      if (facts.artist) {
        return {
          lead: `${facts.artist}を軸に、好みの輪郭がはっきりしている`,
          follow: "参照点が多いのに軸がぶれない",
        };
      }
      return null;
    }
    case "playing-style": {
      if (facts.playingStyle && facts.instrument) {
        return {
          lead: `${facts.instrument}は${facts.playingStyle}寄り`,
          follow: "音作りの解像度が高い",
        };
      }
      if (facts.instrumentDuo) {
        return {
          lead: `${facts.instrumentDuo}を使い分ける`,
          follow: "役割の見立てが早い",
        };
      }
      if (facts.instrument) {
        return { lead: `${facts.instrument}の音色設計に時間をかけている` };
      }
      return null;
    }
    case "band-role": {
      if (facts.instrument && facts.part) {
        return {
          lead: `${facts.instrument}を担当し、${facts.part}を探している`,
          follow: "編成の見立てが早い",
        };
      }
      if (facts.instrument) {
        return {
          lead: `${facts.instrument}の立ち位置を大事にしたい`,
          follow: "役割分担のイメージがはっきりしている",
        };
      }
      return {
        lead: "バンドの中で自分が何を担うか、すでに決まっている",
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
          lead: `活動ペースは${facts.commitment}`,
          follow: "スタジオでの過ごし方まで具体化している",
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
          follow: "ライブの記憶が表情に出る",
        };
      }
      if (facts.ritualSong) {
        return {
          lead: `ライブ前は${facts.ritualSong}から入る`,
          follow: "会場に出る前の儀式まで決まっている",
        };
      }
      return {
        lead: "ライブの話だけ、声のトーンが変わる",
      };
    }
    case "gear-focus": {
      if (facts.gear) {
        return {
          lead: `${facts.gear}にこだわりがある`,
          follow: "音の出し方まで設計している",
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
          follow: "そこから今の好みまで一本線でつながる",
        };
      }
      if (facts.obsession) {
        return {
          lead: `最近は${facts.obsession}に入っている`,
          follow: "新しい音との出会い方が自分なり",
        };
      }
      if (facts.hero) {
        return {
          lead: `${facts.hero}から音楽に入った`,
          follow: "影響の輪郭がはっきりしている",
        };
      }
      return null;
    }
    case "personality": {
      if (facts.fashionNote) {
        return {
          lead: facts.fashionNote,
          follow: "見た目と音楽の方向性が揃っている",
        };
      }
      if (facts.temperamentNote) {
        return {
          lead: facts.temperamentNote,
          follow: "そのまま音楽への向き合い方にも出ている",
        };
      }
      return {
        lead: "言葉数は多くないのに、輪郭ははっきり残る",
      };
    }
    case "band-purpose": {
      if (facts.dream) {
        return { lead: facts.dream, follow: "理想像まで具体化している" };
      }
      if (facts.bandVision) {
        return {
          lead: facts.bandVision,
          follow: "バンドを組む理由がはっきりしている",
        };
      }
      return {
        lead: "バンドに何を求めるか、最初から言葉にできている",
      };
    }
    case "cover-song": {
      if (facts.coverSong && facts.coverArtist) {
        return {
          lead: `${facts.coverArtist}の${facts.coverSong}をコピーしたい`,
          follow: "譜面より入り方にこだわりがある",
        };
      }
      if (facts.coverSong) {
        return {
          lead: `『${facts.coverSong}』を一緒に鳴らしたい`,
          follow: "譜面より入り方にこだわりがある",
        };
      }
      return {
        lead: "コピー曲の候補を、すでにいくつか持っている",
      };
    }
    case "favorite-genre": {
      if (facts.genreDuo) {
        return {
          lead: `${facts.genreDuo}を横断する聴き方`,
          follow: "系譜の話まで自分から掘れる",
        };
      }
      if (facts.genre) {
        return {
          lead: `${facts.genre}を軸に音楽を選ぶ`,
          follow: "その系譜まで自分から掘れる",
        };
      }
      return null;
    }
    case "non-music-values": {
      if (facts.fashionNote) {
        return {
          lead: facts.fashionNote,
          follow: "音楽以外の価値観もはっきりしている",
        };
      }
      if (facts.location) {
        return {
          lead: `${facts.location}を拠点に活動している`,
          follow: "土地のリズムが音楽にも出ている",
        };
      }
      return {
        lead: "音楽と日常を、別々の箱に入れない",
      };
    }
    case "communication-style": {
      if (facts.temperamentNote) {
        return {
          lead: facts.temperamentNote,
          follow: "言葉の精度が高い",
        };
      }
      return {
        lead: "答える前に一度間を置く",
        follow: "その分、言葉の精度が高い",
      };
    }
    default:
      return null;
  }
}

function buildFallbackDraft(ctx: IntroContext): AngleDraft {
  const { facts } = ctx;

  if (facts.coverSong && facts.coverArtist) {
    return {
      lead: `${facts.coverArtist}の${facts.coverSong}をコピーしたい`,
      follow: "譜面より入り方にこだわりがある",
    };
  }

  if (facts.playingStyle && facts.instrument) {
    return {
      lead: `${facts.instrument}は${facts.playingStyle}寄り`,
      follow: "音作りの解像度が高い",
    };
  }

  if (facts.listeningMood) {
    return buildListeningDraft(facts, ctx.seed);
  }

  if (facts.artistDuo) {
    return {
      lead: `${facts.artistDuo}を行き来する聴き方`,
      follow: "参照点が多いのに、好みの軸がぶれない",
    };
  }

  if (facts.bandVision) {
    return {
      lead: facts.bandVision,
      follow: "バンドを組む理由がはっきりしている",
    };
  }

  if (facts.artist) {
    return {
      lead: `${facts.artist}を軸に、自分の音楽を組み立てる`,
      follow: "参照と創作の距離感が近い",
    };
  }

  return {
    lead: "音楽の輪郭が、少しずつはっきりしてくる人",
  };
}

function enrichShortDraft(ctx: IntroContext, draft: AngleDraft): AngleDraft {
  if (draft.follow) {
    return draft;
  }

  const { facts } = ctx;
  const extras = [
    facts.coverSong && facts.coverArtist
      ? `${facts.coverArtist}の${facts.coverSong}をコピーしたい`
      : undefined,
    facts.artist ? `${facts.artist}を軸に音楽を選ぶ` : undefined,
    facts.instrument ? `${facts.instrument}の音色設計に時間をかけている` : undefined,
    facts.genre ? `${facts.genre}を横断する聴き方` : undefined,
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
        ["two-part", "trait-first", "surprise-first"],
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

  const fallback = buildFallbackDraft(ctx);
  const fallbackText = fitLength(
    applyStructure("two-part", fallback.lead, fallback.follow, ctx.seed),
    ctx.seed
  );

  return {
    angle: ctx.angle,
    comment: fallbackText,
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
