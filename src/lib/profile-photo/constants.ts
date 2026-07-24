export const PROFILE_PHOTO_OUTPUT_SIZE = 1200;

export const RECOMMENDED_PHOTO_SAMPLES = [
  {
    id: "natural-light",
    label: "自然光のポートレート",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80&auto=format&fit=crop",
  },
  {
    id: "live",
    label: "ライブ中の一枚",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80&auto=format&fit=crop",
  },
  {
    id: "instrument",
    label: "楽器を持った写真",
    image:
      "https://images.unsplash.com/photo-1511379938549-c1f69419868d?w=400&q=80&auto=format&fit=crop",
  },
  {
    id: "studio",
    label: "スタジオでの自然な写真",
    image:
      "https://images.unsplash.com/photo-1516280440614-379379bb347d?w=400&q=80&auto=format&fit=crop",
  },
] as const;

export const PHOTO_TIP_ITEMS = [
  "顔がわかる",
  "あなたらしい服装",
  "楽器と一緒でもOK",
  "ライブ写真も歓迎",
  "自然な笑顔や真剣な表情",
] as const;

export const OPTIMIZING_MESSAGE = "あなたらしさを引き出しています...";
