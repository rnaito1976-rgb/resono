/** AI会話・登録で増えるプロフィール項目の種類 */
export type ProfileItemKind =
  | "music-dna"
  | "favorite-live"
  | "dream-band"
  | "first-album"
  | "fashion-style"
  | "live-ritual"
  | "current-obsession"
  | "favorite-gear"
  | "creative-process"
  | "guitar-heroes";

export type ProfileItem = {
  kind: ProfileItemKind;
  value: string;
  /** 補足（例: Live Ritual のアーティスト名） */
  detail?: string;
  updatedAt: string;
};

export const PROFILE_ITEM_LABELS: Record<ProfileItemKind, string> = {
  "music-dna": "Music DNA",
  "favorite-live": "Favorite Live",
  "dream-band": "Dream Band",
  "first-album": "First Album",
  "fashion-style": "Fashion Style",
  "live-ritual": "Live Ritual",
  "current-obsession": "Current Obsession",
  "favorite-gear": "Favorite Gear",
  "creative-process": "Creative Process",
  "guitar-heroes": "Guitar Heroes",
};

/** @deprecated profileCards からの移行用 */
export type LegacyProfileCard = {
  id?: string;
  kind: ProfileItemKind;
  title?: string;
  content: string;
  subtitle?: string;
  sourceQuestionId?: string;
  createdAt?: string;
};
