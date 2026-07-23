import type { Member } from "@/types/member";
import { DEFAULT_PHOTO_URL } from "@/lib/onboarding/status";

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

export const WEEKEND_OPTIONS = [
  "一人で音楽を聴く",
  "友達とライブやイベント",
  "創作や練習に没頭",
  "自然の中で過ごす",
  "カフェで読書や思考",
] as const;

export const DISTANCE_OPTIONS = [
  "まずは距離を保ちたい",
  "少人数が落ち着く",
  "いろんな人と関わりたい",
  "深い対話を大切にする",
] as const;

export const FUTURE_OPTIONS = [
  "自分の表現を深めたい",
  "共鳴する仲間と出会いたい",
  "ライブで届けたい",
  "まだ模索中",
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
  artists: string[];
  weekend: string;
  distance: string;
  future: string;
  values: string[];
  photo?: string;
};

export type DialogueStep =
  | {
      id: "artists";
      message: string;
      type: "multi";
      options: readonly string[];
      min: number;
    }
  | {
      id: "weekend" | "distance" | "future";
      message: string;
      type: "single";
      options: readonly string[];
    }
  | {
      id: "values" | "venues";
      message: string;
      type: "multi";
      options: readonly string[];
      min: number;
    }
  | {
      id: "photo";
      message: string;
      type: "photo";
    };

export const INITIAL_DIALOGUE_STEPS: DialogueStep[] = [
  {
    id: "artists",
    message: "最近、心に残っている音楽やアーティストは？",
    type: "multi",
    options: SUGGESTED_ARTISTS,
    min: 1,
  },
  {
    id: "weekend",
    message: "休日は、どんな時間の過ごし方が多い？",
    type: "single",
    options: WEEKEND_OPTIONS,
  },
  {
    id: "distance",
    message: "人との距離感、どれが近い？",
    type: "single",
    options: DISTANCE_OPTIONS,
  },
  {
    id: "future",
    message: "将来、音楽とどう関わっていたい？",
    type: "single",
    options: FUTURE_OPTIONS,
  },
  {
    id: "values",
    message: "大切にしている価値観を選んでください。",
    type: "multi",
    options: VALUE_OPTIONS,
    min: 1,
  },
  {
    id: "photo",
    message:
      "あなたの雰囲気が伝わる写真があれば選んでください。なくても大丈夫です。",
    type: "photo",
  },
];

export const DISCOVER_DIALOGUE_STEPS: DialogueStep[] = [
  {
    id: "artists",
    message: "最近ハマっている映画や作品はある？",
    type: "multi",
    options: [
      "映画: ドライブ・マイ・カー",
      "映画: インターステラー",
      "映画: 千と千尋の神隠し",
      "映画: ラ・ラ・ランド",
      "映画: ブレードランナー",
      "映画: ヘッドウィングス",
    ],
    min: 1,
  },
  {
    id: "weekend",
    message: "会話のテンポ、どれが近い？",
    type: "single",
    options: ["ゆっくり深く", "テンポよく軽やか", "沈黙も心地いい", "即興的で自由"],
  },
  {
    id: "venues",
    message: "好きな空気感の場所は？",
    type: "multi",
    options: [
      "下北沢SHELTER",
      "WWW",
      "Liquidroom",
      "Zepp Shinjuku",
      "Blue Note Tokyo",
      "KOENJI HIGH",
    ],
    min: 1,
  },
];

export function buildMemberFromDialogue(
  member: Member,
  answers: DialogueAnswers
): Member {
  const valueTags = answers.values.slice(0, 3);
  const artistTags = answers.artists.slice(0, 3);

  return {
    ...member,
    photo: answers.photo && answers.photo !== DEFAULT_PHOTO_URL ? answers.photo : member.photo,
    tags: Array.from(new Set([...valueTags, ...artistTags])),
    aiComment: buildAiComment(answers),
    portrait: {
      ...member.portrait,
      bio: buildBio(answers),
      influences: answers.values.map((value) => `価値観:${value}`),
      dialogueCompleted: true,
    },
    music: {
      ...member.music,
      favoriteArtists: Array.from(
        new Set([...member.music.favoriteArtists, ...answers.artists])
      ),
      listeningMood: answers.weekend,
    },
    mood: {
      ...member.mood,
      keywords: Array.from(
        new Set([answers.weekend, answers.distance, ...member.mood.keywords])
      ),
      atmosphere: `${answers.distance}。${answers.weekend}。`,
      description: answers.future,
    },
    lookingFor: {
      ...member.lookingFor,
      bandVision: answers.future,
    },
  };
}

export function enrichMemberFromDiscover(
  member: Member,
  answers: { media: string[]; tempo: string; venues: string[] }
): Member {
  return {
    ...member,
    portrait: {
      ...member.portrait,
      influences: Array.from(
        new Set([...member.portrait.influences, ...answers.media])
      ),
    },
    mood: {
      ...member.mood,
      keywords: Array.from(
        new Set([...member.mood.keywords, ...answers.venues])
      ),
      atmosphere: answers.tempo,
    },
  };
}

function buildAiComment(answers: DialogueAnswers): string {
  const artist = answers.artists[0] ?? "音";
  const value = answers.values[0] ?? "感性";

  return `${artist}と${value}を大切にする、静かで確かな温度感。`;
}

function buildBio(answers: DialogueAnswers): string {
  return `${answers.weekend}。${answers.distance}。${answers.future}。`;
}

export function mergeDialogueAnswers(
  current: Partial<DialogueAnswers>,
  stepId: DialogueStep["id"],
  value: string | string[]
): Partial<DialogueAnswers> {
  switch (stepId) {
    case "artists":
      return { ...current, artists: value as string[] };
    case "weekend":
      return { ...current, weekend: value as string };
    case "distance":
      return { ...current, distance: value as string };
    case "future":
      return { ...current, future: value as string };
    case "values":
      return { ...current, values: value as string[] };
    case "photo":
      return { ...current, photo: value as string };
    default:
      return current;
  }
}

export function isDialogueAnswersComplete(
  answers: Partial<DialogueAnswers>
): answers is DialogueAnswers {
  return Boolean(
    answers.artists?.length &&
      answers.weekend &&
      answers.distance &&
      answers.future &&
      answers.values?.length
  );
}
