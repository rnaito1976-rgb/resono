export const WELCOME_ARTIST_PRESETS = [
  "Radiohead",
  "Oasis",
  "羊文学",
  "King Gnu",
  "The 1975",
] as const;

export const WELCOME_COVER_PRESETS = [
  "No Surprises",
  "Just",
  "Creep",
  "怪獣",
  "丸ノ内サディスティック",
] as const;

export const WELCOME_PART_PRESETS = [
  "Vocal",
  "Guitar",
  "Bass",
  "Drums",
  "Keyboard",
  "Other",
] as const;

export const WELCOME_BAND_STYLE_OPTIONS = [
  "コピー中心",
  "オリジナル中心",
  "どちらも",
  "まだ決めていない",
] as const;

export type WelcomeQuestionConfig = {
  emoji: string;
  title: string;
  subtitle?: string;
  presets: readonly string[];
  multi: boolean;
  searchable: boolean;
  placeholder?: string;
};

export const WELCOME_QUESTIONS: Record<
  "artists" | "covers" | "parts" | "band-style",
  WelcomeQuestionConfig
> = {
  artists: {
    emoji: "🎧",
    title: "好きなアーティストは？",
    presets: WELCOME_ARTIST_PRESETS,
    multi: true,
    searchable: true,
    placeholder: "アーティストを検索",
  },
  covers: {
    emoji: "🎸",
    title: "今コピーしたい曲は？",
    presets: WELCOME_COVER_PRESETS,
    multi: true,
    searchable: true,
    placeholder: "曲名を検索",
  },
  parts: {
    emoji: "🎤",
    title: "担当したいパートは？",
    presets: WELCOME_PART_PRESETS,
    multi: true,
    searchable: false,
  },
  "band-style": {
    emoji: "🎵",
    title: "どんなバンドをやりたい？",
    presets: WELCOME_BAND_STYLE_OPTIONS,
    multi: false,
    searchable: false,
  },
};

export const WELCOME_ANALYSIS_STEPS = [
  { emoji: "🎧", label: "音楽の好みを分析" },
  { emoji: "🎸", label: "演奏スタイルを整理" },
  { emoji: "🎵", label: "共鳴する仲間を探しています…" },
] as const;
