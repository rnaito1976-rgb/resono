export type ProfileGrowSection = "about" | "music" | "band";

export type ProfileGrowFieldKey =
  | "aboutMe"
  | "bio"
  | "values"
  | "favoriteArtists"
  | "favoriteSongs"
  | "favoriteBands"
  | "genres"
  | "wantToCover"
  | "wantToPlay"
  | "favoriteLiveHouses"
  | "favoriteStudios"
  | "favoriteFestivals"
  | "gear"
  | "videos"
  | "lookingFor"
  | "style"
  | "schedule"
  | "setList"
  | "liveHistory";

export type ProfileGrowPickerKind =
  | "artists"
  | "songs"
  | "bands"
  | "genres"
  | "cover"
  | "parts"
  | "liveHouses"
  | "studios"
  | "festivals"
  | "gear"
  | "style"
  | "members";

export type ProfileGrowInputMode = "select" | "free";

export type ProfileGrowQuestion = {
  message: string;
  inputMode: ProfileGrowInputMode;
  field: ProfileGrowFieldKey;
  picker?: ProfileGrowPickerKind;
  freeFields?: ProfileGrowFieldKey[];
};

export type ProfileGrowCandidate = {
  id: string;
  field: ProfileGrowFieldKey;
  section: ProfileGrowSection;
  value: string;
  detail?: string;
};

export type ProfileGrowThemeId =
  | "favorite-music"
  | "playing-style"
  | "live"
  | "gear"
  | "band-activity"
  | "production"
  | "live-houses"
  | "studios"
  | "festivals";

export type ProfileGrowTheme = {
  id: ProfileGrowThemeId;
  label: string;
  opener: string;
  questions: [ProfileGrowQuestion, ProfileGrowQuestion, ProfileGrowQuestion];
};

export type ProfileGrowResonanceInsight = {
  scoreDelta: number;
  /** 更新後の代表的な共鳴度 */
  score?: number;
  commonPoints: string[];
};
