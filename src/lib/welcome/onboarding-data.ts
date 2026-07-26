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

export const WELCOME_ARTIST_GROUPS: WelcomeOptionGroup[] = [
  {
    label: "Japanese Rock",
    items: [
      "BUMP OF CHICKEN",
      "ASIAN KUNG-FU GENERATION",
      "ELLEGARDEN",
      "the HIATUS",
      "MONOEYES",
      "ストレイテナー",
      "ACIDMAN",
      "9mm Parabellum Bullet",
      "Base Ball Bear",
      "People In The Box",
      "androp",
      "cinema staff",
      "Age Factory",
      "凛として時雨",
      "TK from 凛として時雨",
      "LITE",
      "toe",
      "tricot",
      "envy",
      "THE ORAL CIGARETTES",
      "BLUE ENCOUNT",
      "ROTTENGRAFFTY",
      "Nothing's Carved In Stone",
      "ONE OK ROCK",
      "MAN WITH A MISSION",
      "[Alexandros]",
      "SiM",
      "coldrain",
      "Crossfaith",
      "Fear, and Loathing in Las Vegas",
      "Dragon Ash",
      "マキシマム ザ ホルモン",
      "WANIMA",
      "10-FEET",
      "HEY-SMITH",
      "SHANK",
      "dustbox",
      "locofrank",
      "Northern19",
      "BRAHMAN",
      "KEMURI",
      "Hi-STANDARD",
      "Ken Yokoyama",
    ],
  },
  {
    label: "J-Pop",
    items: [
      "Mr.Children",
      "スピッツ",
      "サカナクション",
      "King Gnu",
      "millennium parade",
      "Vaundy",
      "藤井風",
      "RADWIMPS",
      "Official髭男dism",
      "Mrs. GREEN APPLE",
      "ヨルシカ",
      "YOASOBI",
      "米津玄師",
      "Ado",
      "あいみょん",
      "back number",
      "マカロニえんぴつ",
      "SUPER BEAVER",
      "sumika",
      "Saucy Dog",
      "クリープハイプ",
      "My Hair is Bad",
      "フレデリック",
      "indigo la End",
      "ゲスの極み乙女",
      "ずっと真夜中でいいの。",
      "Creepy Nuts",
      "リーガルリリー",
      "Hump Back",
      "SHISHAMO",
      "きのこ帝国",
      "くるり",
      "Chilli Beans.",
      "Kroi",
      "Nulbarich",
      "Suchmos",
      "Omoinotake",
      "緑黄色社会",
      "Novelbright",
      "SEKAI NO OWARI",
    ],
  },
  {
    label: "Visual Kei",
    items: [
      "L'Arc-en-Ciel",
      "GLAY",
      "LUNA SEA",
      "X JAPAN",
      "DIR EN GREY",
      "the GazettE",
      "Janne Da Arc",
      "Acid Black Cherry",
      "シド",
      "MUCC",
      "ナイトメア",
      "Plastic Tree",
      "D'ERLANGER",
    ],
  },
  {
    label: "Anime",
    items: [
      "LiSA",
      "Aimer",
      "Eve",
      "ReoNa",
      "ClariS",
      "藍井エイル",
      "TRUE",
      "ZAQ",
      "fripSide",
      "FLOW",
      "GRANRODEO",
      "OxT",
      "Linked Horizon",
      "MY FIRST STORY",
      "UNISON SQUARE GARDEN",
      "SPYAIR",
      "ROOKiEZ is PUNK'D",
    ],
  },
  {
    label: "Vocaloid",
    items: [
      "DECO*27",
      "Orangestar",
      "じん",
      "n-buna",
      "kemu",
      "ピノキオピー",
      "wowaka",
      "40mP",
      "HoneyWorks",
    ],
  },
  {
    label: "Idol",
    items: [
      "乃木坂46",
      "櫻坂46",
      "日向坂46",
      "AKB48",
      "SKE48",
      "NMB48",
      "HKT48",
      "ももいろクローバーZ",
      "＝LOVE",
      "≠ME",
      "FRUITS ZIPPER",
      "BABYMETAL",
      "でんぱ組.inc",
    ],
  },
  {
    label: "Alternative / Indie",
    items: [
      "Radiohead",
      "Oasis",
      "The 1975",
      "Arctic Monkeys",
      "The Strokes",
      "Blur",
      "Muse",
      "Coldplay",
      "The Killers",
      "Franz Ferdinand",
      "Bloc Party",
      "Foals",
      "The xx",
      "Phoenix",
      "Interpol",
      "Placebo",
      "The Smashing Pumpkins",
      "Cage The Elephant",
      "Tame Impala",
      "Vampire Weekend",
    ],
  },
  {
    label: "Rock / Classic Rock",
    items: [
      "The Beatles",
      "The Rolling Stones",
      "Queen",
      "Led Zeppelin",
      "Pink Floyd",
      "Nirvana",
      "Foo Fighters",
      "Red Hot Chili Peppers",
      "Pearl Jam",
      "Weezer",
      "Green Day",
      "Bon Jovi",
      "Aerosmith",
      "Guns N' Roses",
      "AC/DC",
      "KISS",
      "Van Halen",
    ],
  },
  {
    label: "Punk / Emo / Loud",
    items: [
      "Blink-182",
      "Sum 41",
      "The Offspring",
      "Fall Out Boy",
      "My Chemical Romance",
      "Paramore",
      "Panic! At The Disco",
      "Jimmy Eat World",
      "Simple Plan",
      "Bring Me The Horizon",
      "Slipknot",
      "System Of A Down",
      "Avenged Sevenfold",
      "Linkin Park",
      "Korn",
    ],
  },
  {
    label: "Pop / Modern Pop",
    items: [
      "Taylor Swift",
      "Ed Sheeran",
      "Billie Eilish",
      "Olivia Rodrigo",
      "Dua Lipa",
      "Ariana Grande",
      "Bruno Mars",
      "Lady Gaga",
      "Adele",
      "Maroon 5",
      "Justin Bieber",
      "The Weeknd",
      "SZA",
    ],
  },
  {
    label: "R&B / Soul / Funk",
    items: [
      "Stevie Wonder",
      "Michael Jackson",
      "Prince",
      "Earth, Wind & Fire",
      "Marvin Gaye",
      "James Brown",
      "Jamiroquai",
      "Vulfpeck",
      "Cory Wong",
      "Anderson .Paak",
    ],
  },
  {
    label: "Jazz / Fusion",
    items: [
      "Herbie Hancock",
      "Pat Metheny",
      "Snarky Puppy",
      "Weather Report",
      "Chick Corea",
      "Miles Davis",
    ],
  },
  {
    label: "Electronic / Dance",
    items: [
      "Daft Punk",
      "Justice",
      "The Chemical Brothers",
      "Underworld",
      "Aphex Twin",
      "Skrillex",
      "deadmau5",
      "Porter Robinson",
      "Disclosure",
    ],
  },
];

export const WELCOME_ARTIST_CATALOG = flattenWelcomeGroups(WELCOME_ARTIST_GROUPS);

/** Initial catalog. Additional names can be added via search. */

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
    title: "担当パートは？",
    presets: WELCOME_PART_PRESETS,
    searchable: false,
    minSelected: 1,
  },
  sounds: {
    kind: "sounds",
    title: "好きなジャンルは？",
    subtitle: "好きな音楽の方向性から、共鳴が深まります。",
    presets: WELCOME_SOUND_PRESETS,
    searchable: true,
    placeholder: "ジャンルを検索",
    minSelected: 1,
  },
};

export const WELCOME_ANALYSIS_STEPS = [
  "音楽の好みを分析",
  "好きなジャンルを整理",
  "共鳴する仲間を探しています…",
] as const;

export const WELCOME_COLOR_QUESTION = {
  title: "好きな色は？",
  subtitle: "選んだ色が、あなたの primary color になります。",
} as const;
