import type { WelcomeOptionGroup } from "@/lib/welcome/onboarding-data";

export const PROFILE_GROW_LIVE_HOUSE_GROUPS: WelcomeOptionGroup[] = [
  {
    label: "下北沢",
    items: [
      "下北沢SHELTER",
      "下北沢CLUB Que",
      "下北沢ERA",
      "下北沢ReG",
      "下北沢MOSAiC",
      "下北沢DaisyBar",
      "LIVEHOLIC",
      "BASEMENTBAR",
      "Flowers Loft",
      "THREE",
    ],
  },
  {
    label: "渋谷",
    items: [
      "渋谷CLUB QUATTRO",
      "Spotify O-EAST",
      "Spotify O-WEST",
      "WWW",
      "WWW X",
      "Veats Shibuya",
      "TSUTAYA O-Crest",
      "TSUTAYA O-nest",
      "渋谷La.mama",
      "eggman",
      "duo MUSIC EXCHANGE",
      "恵比寿LIQUIDROOM",
    ],
  },
  {
    label: "新宿",
    items: [
      "新宿LOFT",
      "新宿MARZ",
      "新宿ACB HALL",
      "CLUB251",
      "Zepp Shinjuku",
    ],
  },
  {
    label: "東京その他",
    items: [
      "新代田FEVER",
      "Zepp DiverCity",
      "Zepp Haneda",
      "高田馬場AREA",
      "池袋Live Arena",
    ],
  },
  {
    label: "関西",
    items: ["心斎橋BIG CAT", "心斎橋PANGEA", "なんばHatch", "京都MUSE"],
  },
  {
    label: "その他",
    items: ["Other"],
  },
];

export const PROFILE_GROW_STUDIO_GROUPS: WelcomeOptionGroup[] = [
  {
    label: "東京",
    items: [
      "Studio Noah",
      "Studio Penta",
      "SOUND STUDIO PACKS",
      "Gateway Studio",
      "Bass On Top",
      "AST",
      "Sound Arts",
      "Noah Prime",
    ],
  },
  {
    label: "その他",
    items: ["Other"],
  },
];

export const PROFILE_GROW_FESTIVAL_GROUPS: WelcomeOptionGroup[] = [
  {
    label: "国内",
    items: [
      "FUJI ROCK",
      "SUMMER SONIC",
      "ROCK IN JAPAN",
      "JAPAN JAM",
      "VIVA LA ROCK",
      "METROCK",
      "COUNTDOWN JAPAN",
      "RISING SUN",
      "SWEET LOVE SHOWER",
      "京都大作戦",
      "ARABAKI",
      "YON FES",
      "DEAD POP FESTiVAL",
      "SATANIC CARNIVAL",
      "森、道、市場",
      "GREENROOM",
      "OSAKA GIGANTIC MUSIC FESTIVAL",
      "WILD BUNCH",
      "TREASURE05X",
      "JOIN ALIVE",
    ],
  },
  {
    label: "その他",
    items: ["Other"],
  },
];

/** 手放せない機材（Discover / プロフィール編集） */
export const PROFILE_GROW_GEAR_GROUPS: WelcomeOptionGroup[] = [
  {
    label: "ギター",
    items: [
      "Fender Stratocaster",
      "Fender Telecaster",
      "Fender Jazzmaster",
      "Fender Mustang",
      "Gibson Les Paul",
      "Gibson SG",
      "Gibson ES-335",
      "PRS Custom24",
      "Ibanez AZ",
      "Ibanez RG",
      "Suhr Classic S",
      "Suhr Modern",
      "Strandberg Boden",
      "Music Man JP6",
      "Gretsch Electromatic",
      "Epiphone Casino",
      "Martin D-28",
      "Gibson J-45",
      "Yamaha Pacifica",
      "Squier Classic Vibe Strat",
      "Fender Jaguar",
      "Gibson Flying V",
      "Ernie Ball Music Man",
      "Taylor 814ce",
    ],
  },
  {
    label: "ベース",
    items: [
      "Fender Jazz Bass",
      "Fender Precision Bass",
      "Music Man StingRay",
      "Ibanez SR",
      "Rickenbacker 4003",
      "Warwick Streamer",
      "Sandberg California",
      "Spector NS",
      "Fender Mustang Bass",
      "Gibson Thunderbird",
    ],
  },
  {
    label: "アンプ / シミュレーター",
    items: [
      "Kemper",
      "Quad Cortex",
      "HX Stomp",
      "Fractal FM3",
      "Line 6 Helix",
      "BOSS GT-1000CORE",
      "MS-3",
      "Fender Twin Reverb",
      "Marshall JCM800",
      "Vox AC30",
      "Orange Rockerverb",
      "Boss Katana",
      "Mesa Boogie Dual Rectifier",
      "Ampeg SVT",
    ],
  },
  {
    label: "エフェクター",
    items: [
      "Strymon BigSky",
      "Strymon Timeline",
      "Strymon Mobius",
      "Empress Reverb",
      "Eventide H90",
      "Jan Ray",
      "TS808",
      "Blues Driver",
      "RAT",
      "OCD",
      "Big Muff",
      "PolyTune",
      "Boss DD-500",
      "Boss RV-500",
      "MXR Carbon Copy",
      "Electro-Harmonix Memory Man",
      "Origin Effects Cali76",
      "Keeley Compressor",
      "Boss CS-3",
      "Ibanez Tube Screamer Mini",
      "Universal Audio UAFX",
      "Lehle Switcher",
      "Boss VE-22",
      "TC Helicon GoXLR",
      "Palmer PDI-09",
      "Strymon Volante",
      "Strymon Flint",
      "Chase Bliss Warped Vinyl",
      "EarthQuaker Devices Plumes",
      "Wampler Tumnus",
    ],
  },
  {
    label: "ドラム",
    items: [
      "Pearl Export",
      "Yamaha Stage Custom",
      "DW Collectors",
      "Tama Starclassic",
      "Roland TD-27",
      "Zildjian A Custom",
      "Sabian HHX",
      "Ludwig Classic Maple",
      "Gretsch Catalina",
    ],
  },
  {
    label: "キーボード / シンセ",
    items: [
      "Nord Stage",
      "Yamaha CP88",
      "Roland Juno-106",
      "Korg Minilogue",
      "Moog Subsequent 37",
      "Roland SP-404",
      "Teenage Engineering OP-1",
      "Akai MPC One",
      "Elektron Digitakt",
      "Korg SV-2",
      "Roland FP-30X",
    ],
  },
  {
    label: "その他",
    items: ["Other"],
  },
];

/** 欲しい機材 */
export const PROFILE_GROW_WANTED_GEAR_GROUPS: WelcomeOptionGroup[] = [
  {
    label: "欲しい機材",
    items: [
      "Quad Cortex",
      "HX Stomp XL",
      "FM9",
      "FM3",
      "Kemper Stage",
      "Strymon Deco",
      "BigSky MX",
      "Timeline",
      "Cloudburst",
      "Iridium",
      "UAFX Dream",
      "Ruby",
      "Lion",
      "Chase Bliss Mood",
      "Blooper",
      "H90",
      "Neural DSP Nano Cortex",
    ],
  },
  {
    label: "その他",
    items: ["Other"],
  },
];

/** DAW・制作機材 */
export const PROFILE_GROW_PRODUCTION_GROUPS: WelcomeOptionGroup[] = [
  {
    label: "DAW",
    items: [
      "Logic Pro",
      "Ableton Live",
      "Cubase",
      "Studio One",
      "FL Studio",
      "Pro Tools",
      "Reaper",
      "GarageBand",
      "Bitwig",
      "Cakewalk",
    ],
  },
  {
    label: "機材",
    items: [
      "Apollo Twin",
      "Scarlett 2i2",
      "SSL2+",
      "Babyface Pro",
      "MOTU M2",
      "Push3",
      "Maschine+",
      "Launchpad",
      "MPK mini",
      "KeyLab",
    ],
  },
  {
    label: "その他",
    items: ["Other"],
  },
];

export const PROFILE_GROW_STYLE_GROUPS: WelcomeOptionGroup[] = [
  {
    label: "バンドスタイル",
    items: [
      "コピー中心",
      "オリジナル中心",
      "コピー→オリジナル",
      "趣味バンド",
      "社会人バンド",
      "月1活動",
      "月2活動",
      "ライブ中心",
      "レコーディング中心",
      "配信中心",
      "セッション中心",
      "ライブハウス中心",
      "フェス出演を目指す",
      "プロ志向",
      "ゆるく続けたい",
      "長く続けたい",
      "ワンマンを目指す",
    ],
  },
  {
    label: "その他",
    items: ["Other"],
  },
];

export const PROFILE_GROW_SONG_GROUPS: WelcomeOptionGroup[] = [
  {
    label: "Alternative",
    items: [
      "Radiohead - No Surprises",
      "Radiohead - Creep",
      "Muse - Plug In Baby",
      "Oasis - Wonderwall",
      "blur - Song 2",
    ],
  },
  {
    label: "Japanese",
    items: [
      "BUMP OF CHICKEN - 天体観測",
      "ASIAN KUNG-FU GENERATION - リライト",
      "King Gnu - 白日",
      "Vaundy - 怪獣の花束",
    ],
  },
  {
    label: "その他",
    items: ["Other"],
  },
];

export const PROFILE_GROW_OTHER_LABEL = "Other";
