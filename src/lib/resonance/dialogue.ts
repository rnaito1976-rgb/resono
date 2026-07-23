import type { Member } from "@/types/member";

export const SUGGESTED_ARTISTS = [
  "宇多田ヒカル",
  "King Gnu",
  "Radiohead",
  "FKJ",
  "Nujabes",
  "Billie Eilish",
  "Vaundy",
  "YOASOBI",
  "Tyler, The Creator",
  "Frank Ocean",
  "米津玄師",
  "NewJeans",
  "Khruangbin",
  "Cornelius",
  "椎名林檎",
] as const;

export const GENRE_OPTIONS = [
  "ロック",
  "UKロック",
  "ポップ",
  "インディー",
  "ジャズ",
  "R&B",
  "ヒップホップ",
  "エレクトロ",
  "フォーク",
  "メタル",
  "パンク",
  "シティポップ",
  "ソウル",
  "ブルース",
  "レゲエ",
  "アンビエント",
] as const;

export const ACTIVITY_AREA_OPTIONS = [
  "東京",
  "神奈川",
  "埼玉",
  "千葉",
  "大阪",
  "京都",
  "神戸",
  "名古屋",
  "福岡",
  "その他",
] as const;

export const PLAYING_PART_OPTIONS = [
  "ボーカル",
  "ギター",
  "ベース",
  "ドラム",
  "キーボード",
  "シンセ",
  "DJ",
  "管楽器",
] as const;

export const BAND_GOAL_OPTIONS = [
  "コピーバンドから始めたい",
  "オリジナル中心のバンド",
  "コピーとオリジナルを半々",
  "まずはセッションから",
  "ライブハウスで定期的に演奏",
  "録音・制作を重視したい",
] as const;

export const LIVE_FREQUENCY_OPTIONS = [
  "月1回くらい",
  "月2〜3回",
  "週1回",
  "ライブより練習重視",
  "機会があれば",
] as const;

export const MUSIC_FOCUS_OPTIONS = [
  "コピー中心",
  "オリジナル中心",
  "コピーからオリジナルへ挑戦",
  "セッション・即興重視",
  "制作・録音重視",
] as const;

export const BAND_VALUE_OPTIONS = [
  "演奏力より人柄",
  "本番の強さ",
  "創作への意欲",
  "練習の継続力",
  "仲間との信頼関係",
  "音楽への真剣さ",
] as const;

export const IDEAL_MEMBER_OPTIONS = [
  "真面目で約束を守る人",
  "ユーモアがあって場を和ませる人",
  "創作意欲が高い人",
  "演奏力が高い人",
  "落ち着いて話せる人",
  "一緒に成長していける人",
] as const;

export const VALUE_OPTIONS = [
  "自由",
  "誠実さ",
  "挑戦",
  "調和",
  "美しさ",
  "情熱",
  "静けさ",
  "ユーモア",
] as const;

export type DialogueAnswers = {
  nickname: string;
  part: string;
  location: string;
  genres: string[];
  bandGoal: string;
  liveFrequency: string;
  musicFocus: string;
  bandValue: string;
  idealMember: string;
};

export type DialogueStep =
  | {
      id: "nickname";
      message: string;
      type: "text";
      placeholder: string;
    }
  | {
      id:
        | "part"
        | "location"
        | "genres"
        | "bandGoal"
        | "liveFrequency"
        | "musicFocus"
        | "bandValue"
        | "idealMember"
        | "artists"
        | "values"
        | "venues"
        | "instruments";
      message: string;
      type: "multi";
      options: readonly string[];
      min: number;
      max?: number;
    }
  | {
      id: "weekend";
      message: string;
      type: "single";
      options: readonly string[];
    };

export const INITIAL_DIALOGUE_STEPS: DialogueStep[] = [
  {
    id: "nickname",
    message: "Resonoで使うニックネームを教えてください。",
    type: "text",
    placeholder: "ニックネーム",
  },
  {
    id: "part",
    message: "担当パートは？",
    type: "multi",
    options: PLAYING_PART_OPTIONS,
    min: 1,
    max: 1,
  },
  {
    id: "location",
    message: "活動エリアは？",
    type: "multi",
    options: ACTIVITY_AREA_OPTIONS,
    min: 1,
    max: 1,
  },
  {
    id: "genres",
    message: "興味のあるジャンルを3〜5個選んでください。",
    type: "multi",
    options: GENRE_OPTIONS,
    min: 3,
    max: 5,
  },
  {
    id: "bandGoal",
    message: "どんなバンドをやってみたい？",
    type: "multi",
    options: BAND_GOAL_OPTIONS,
    min: 1,
    max: 1,
  },
  {
    id: "liveFrequency",
    message: "ライブはどのくらいの頻度でやりたい？",
    type: "multi",
    options: LIVE_FREQUENCY_OPTIONS,
    min: 1,
    max: 1,
  },
  {
    id: "musicFocus",
    message: "コピーとオリジナル、どちらがやりたい？",
    type: "multi",
    options: MUSIC_FOCUS_OPTIONS,
    min: 1,
    max: 1,
  },
  {
    id: "bandValue",
    message: "バンドで一番大切にしたいことは？",
    type: "multi",
    options: BAND_VALUE_OPTIONS,
    min: 1,
    max: 1,
  },
  {
    id: "idealMember",
    message: "どんなメンバーとなら長く続けられそう？",
    type: "multi",
    options: IDEAL_MEMBER_OPTIONS,
    min: 1,
    max: 1,
  },
];

export const DISCOVER_DIALOGUE_STEPS: DialogueStep[] = [
  {
    id: "artists",
    message: "最近、もう一度聴き返したアーティストは？",
    type: "multi",
    options: SUGGESTED_ARTISTS,
    min: 1,
  },
  {
    id: "weekend",
    message: "会話のテンポ、どれが近い？",
    type: "single",
    options: ["ゆっくり深く", "テンポよく軽やか", "沈黙も心地いい", "即興的で自由"],
  },
  {
    id: "values",
    message: "バンド活動で大切にしたいことは？",
    type: "multi",
    options: BAND_VALUE_OPTIONS,
    min: 1,
  },
];

export function buildMemberFromDialogue(
  member: Member,
  answers: DialogueAnswers
): Member {
  const influences = [
    `バンド:${answers.bandGoal}`,
    `活動:${answers.liveFrequency}`,
    `スタイル:${answers.musicFocus}`,
    `大切:${answers.bandValue}`,
    `メンバー:${answers.idealMember}`,
  ];

  return {
    ...member,
    name: answers.nickname.trim() || member.name,
    tags: Array.from(new Set([...answers.genres.slice(0, 3), answers.bandValue])),
    aiComment: buildAiComment(answers),
    portrait: {
      ...member.portrait,
      bio: buildBio(answers),
      location: answers.location,
      influences,
      dialogueCompleted: true,
    },
    music: {
      ...member.music,
      genres: answers.genres,
      instruments: [answers.part],
    },
    lookingFor: {
      ...member.lookingFor,
      bandVision: answers.bandGoal,
      commitment: answers.liveFrequency,
    },
  };
}

export function enrichMemberFromDiscover(
  member: Member,
  answers: { artists: string[]; tempo: string; values: string[] }
): Member {
  const extraInfluences = [
    ...answers.values.map((value) => `大切:${value}`),
    ...(answers.tempo ? [`会話:${answers.tempo}`] : []),
  ];

  return {
    ...member,
    tags: Array.from(new Set([...member.tags, ...answers.values.slice(0, 2)])),
    portrait: {
      ...member.portrait,
      influences: Array.from(
        new Set([...member.portrait.influences, ...extraInfluences])
      ),
    },
    music: {
      ...member.music,
      favoriteArtists: Array.from(
        new Set([...member.music.favoriteArtists, ...answers.artists])
      ),
    },
  };
}

function buildAiComment(answers: DialogueAnswers): string {
  return `${answers.musicFocus}。${answers.bandValue}を大切に、${answers.location}でバンド活動を続けたい。`;
}

function buildBio(answers: DialogueAnswers): string {
  const genres = answers.genres.slice(0, 3).join("・");
  return `${genres}あたりの音楽を、${answers.part}で。${answers.bandGoal}。`;
}

export function mergeDialogueAnswers(
  current: Partial<DialogueAnswers>,
  stepId: DialogueStep["id"],
  value: string | string[]
): Partial<DialogueAnswers> {
  switch (stepId) {
    case "nickname":
      return { ...current, nickname: value as string };
    case "part":
      return { ...current, part: pickSingle(value) };
    case "location":
      return { ...current, location: pickSingle(value) };
    case "genres":
      return { ...current, genres: value as string[] };
    case "bandGoal":
      return { ...current, bandGoal: pickSingle(value) };
    case "liveFrequency":
      return { ...current, liveFrequency: pickSingle(value) };
    case "musicFocus":
      return { ...current, musicFocus: pickSingle(value) };
    case "bandValue":
      return { ...current, bandValue: pickSingle(value) };
    case "idealMember":
      return { ...current, idealMember: pickSingle(value) };
    default:
      return current;
  }
}

function pickSingle(value: string | string[]): string {
  return Array.isArray(value) ? (value[0] ?? "") : value;
}

export function isDialogueAnswersComplete(
  answers: Partial<DialogueAnswers>
): answers is DialogueAnswers {
  return Boolean(
    answers.nickname?.trim() &&
      answers.part &&
      answers.location &&
      answers.genres &&
      answers.genres.length >= 3 &&
      answers.bandGoal &&
      answers.liveFrequency &&
      answers.musicFocus &&
      answers.bandValue &&
      answers.idealMember
  );
}

export function getPlayingParts(member: Member): string[] {
  const instruments = member.music?.instruments;
  return Array.isArray(instruments) ? instruments.filter(Boolean) : [];
}
