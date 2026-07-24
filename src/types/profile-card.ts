/** プロフィールに追加されるカードの種類 */
export type ProfileCardKind =
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

export type ProfileCard = {
  id: string;
  kind: ProfileCardKind;
  title: string;
  content: string;
  subtitle?: string;
  sourceQuestionId?: string;
  createdAt: string;
};

export const PROFILE_CARD_TITLES: Record<ProfileCardKind, string> = {
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
