export type WelcomeOptionGroup = {
  label: string;
  items: readonly string[];
};

export const WELCOME_PART_GROUPS: WelcomeOptionGroup[] = [
  {
    label: "Strings",
    items: ["Guitar", "Bass", "Violin", "Viola", "Cello", "Contrabass"],
  },
  {
    label: "Vocals",
    items: ["Vocal", "Chorus"],
  },
  {
    label: "Keyboards",
    items: ["Keyboard", "Piano", "Synthesizer"],
  },
  {
    label: "Rhythm",
    items: ["Drums", "Percussion"],
  },
  {
    label: "Woodwinds",
    items: ["Flute", "Clarinet", "Oboe", "Bassoon", "Saxophone"],
  },
  {
    label: "Brass",
    items: ["Trumpet", "Trombone", "French Horn", "Euphonium", "Tuba"],
  },
  {
    label: "Traditional",
    items: ["Harmonica", "Accordion", "Ukulele", "Banjo", "Mandolin", "Shamisen", "Koto"],
  },
  {
    label: "Electronic",
    items: ["DJ", "Manipulator", "Sampler"],
  },
  {
    label: "Production",
    items: ["Composer", "Arranger", "Sound Engineer"],
  },
  {
    label: "Other",
    items: ["Other"],
  },
];

export const WELCOME_SOUND_GROUPS: WelcomeOptionGroup[] = [
  {
    label: "Rock",
    items: [
      "Alternative Rock",
      "Indie Rock",
      "J-Rock",
      "UK Rock",
      "Punk",
      "Emo",
      "Shoegaze",
      "Post Rock",
      "Math Rock",
      "Hard Rock",
      "Metal",
      "Loud Rock",
    ],
  },
  {
    label: "Pop",
    items: ["Pop", "City Pop", "Singer-Songwriter"],
  },
  {
    label: "Japanese",
    items: ["アニソン", "ボカロ", "アイドル", "V系", "邦ロック", "渋谷系"],
  },
  {
    label: "Black Music",
    items: ["Funk", "Soul", "R&B", "Hip Hop", "Rap"],
  },
  {
    label: "Dance",
    items: ["Electronic", "EDM", "House", "Techno", "Drum & Bass"],
  },
  {
    label: "Acoustic",
    items: ["Acoustic", "Folk", "Blues", "Jazz", "Fusion", "Bossa Nova"],
  },
  {
    label: "Other",
    items: [
      "Instrumental",
      "Soundtrack",
      "Lo-fi",
      "Ambient",
      "Experimental",
      "Progressive Rock",
    ],
  },
];

export function flattenWelcomeGroups(groups: readonly WelcomeOptionGroup[]): string[] {
  return groups.flatMap((group) => [...group.items]);
}

export const WELCOME_PART_PRESETS = flattenWelcomeGroups(WELCOME_PART_GROUPS);
export const WELCOME_SOUND_PRESETS = flattenWelcomeGroups(WELCOME_SOUND_GROUPS);

export const WELCOME_OTHER_PART_LABEL = "Other";

/** Initial catalog (~100 artists). Additional names can be added via search. */
export const WELCOME_ARTIST_CATALOG = [
  "ASIAN KUNG-FU GENERATION",
  "BUMP OF CHICKEN",
  "ELLEGARDEN",
  "ストレイテナー",
  "ACIDMAN",
  "9mm Parabellum Bullet",
  "the HIATUS",
  "MONOEYES",
  "Base Ball Bear",
  "androp",
  "People In The Box",
  "凛として時雨",
  "TK from 凛として時雨",
  "サカナクション",
  "羊文学",
  "King Gnu",
  "millennium parade",
  "Vaundy",
  "藤井風",
  "RADWIMPS",
  "マカロニえんぴつ",
  "sumika",
  "SUPER BEAVER",
  "クリープハイプ",
  "My Hair is Bad",
  "04 Limited Sazabys",
  "KANA-BOON",
  "フレデリック",
  "indigo la End",
  "ゲスの極み乙女",
  "Mrs. GREEN APPLE",
  "Official髭男dism",
  "Creepy Nuts",
  "ヨルシカ",
  "ずっと真夜中でいいの。",
  "Aimer",
  "YOASOBI",
  "緑黄色社会",
  "Saucy Dog",
  "Hump Back",
  "リーガルリリー",
  "Age Factory",
  "cinema staff",
  "LITE",
  "toe",
  "envy",
  "tricot",
  "きのこ帝国",
  "NUMBER GIRL",
  "ZAZEN BOYS",
  "くるり",
  "スピッツ",
  "Mr.Children",
  "L'Arc-en-Ciel",
  "GLAY",
  "LUNA SEA",
  "X JAPAN",
  "ONE OK ROCK",
  "MAN WITH A MISSION",
  "東京スカパラダイスオーケストラ",
  "SiM",
  "Crossfaith",
  "w.o.d.",
  "coldrain",
  "Pay money To my Pain",
  "Fear, and Loathing in Las Vegas",
  "Radiohead",
  "Oasis",
  "The 1975",
  "Coldplay",
  "Arctic Monkeys",
  "Muse",
  "Blur",
  "The Strokes",
  "Foo Fighters",
  "Nirvana",
  "Red Hot Chili Peppers",
  "Green Day",
  "Linkin Park",
  "My Chemical Romance",
  "Bring Me The Horizon",
  "Nothing But Thieves",
  "Royal Blood",
  "Paramore",
  "The Killers",
  "Phoenix",
  "The xx",
  "Bon Iver",
  "Sigur Rós",
  "The Smashing Pumpkins",
  "Pearl Jam",
] as const;

export type WelcomeQuestionKind = "artists" | "parts" | "sounds";

export type WelcomeQuestionConfig = {
  kind: WelcomeQuestionKind;
  title: string;
  subtitle?: string;
  presets: readonly string[];
  searchable: boolean;
  placeholder?: string;
  minSelected?: number;
  maxSelected?: number;
};

export const WELCOME_QUESTIONS: Record<WelcomeQuestionKind, WelcomeQuestionConfig> = {
  artists: {
    kind: "artists",
    title: "よく聴くアーティストは？",
    subtitle: "好きな音楽から、共鳴が始まります。",
    presets: WELCOME_ARTIST_CATALOG,
    searchable: true,
    placeholder: "アーティストを検索",
    minSelected: 1,
    maxSelected: 20,
  },
  parts: {
    kind: "parts",
    title: "担当パートを選んでください",
    presets: WELCOME_PART_PRESETS,
    searchable: false,
    minSelected: 1,
  },
  sounds: {
    kind: "sounds",
    title: "どんな音楽を演奏したい？",
    presets: WELCOME_SOUND_PRESETS,
    searchable: true,
    placeholder: "ジャンルを検索",
    minSelected: 1,
  },
};

export const WELCOME_ANALYSIS_STEPS = [
  "音楽の好みを分析",
  "演奏スタイルを整理",
  "共鳴する仲間を探しています…",
] as const;

export const WELCOME_COLOR_QUESTION = {
  title: "好きな色は？",
  subtitle: "選んだ色が、あなたの primary color になります。",
} as const;
