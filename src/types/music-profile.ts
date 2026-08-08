import type { ActivityStyleId } from "@/lib/music/activity-style";

/** Manual or linked cover track the member wants to play in a band. */
export type CoverSong = {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  /** Reserved for Spotify / Apple Music / YouTube Music linking. */
  sourceProvider?: "spotify" | "apple_music" | "youtube_music" | "manual";
  externalUrl?: string;
};

export type MusicDnaBar = {
  label: string;
  /** 0–100 */
  value: number;
};

/** Extensible music profile fields stored in members.music JSON. */
export type MemberMusicProfile = {
  genres: string[];
  favoriteArtists: string[];
  instruments: string[];
  listeningMood: string;
  /** Stable id: original | cover | both */
  activityStyle?: ActivityStyleId;
  coverSongs?: CoverSong[];
  /** Tracks the member has covered or performed before. */
  coveredSongs?: CoverSong[];
  dreamBands?: string[];
  playingStyle?: string[];
  musicDna?: MusicDnaBar[];
  /** Future: streamingConnections?, liveHistory?, recentCovers?, performanceVideos? */
  favoriteSongs?: string[];
  favoriteLiveHouses?: string[];
  favoriteStudios?: string[];
  favoriteFestivals?: string[];
  gear?: string[];
  videos?: string[];
};

export type MusicPageView = {
  favoriteArtists: string[];
  coverSongs: CoverSong[];
  dreamBands: string[];
  favoriteGenres: string[];
  musicDna: MusicDnaBar[];
  /** Per-section shared points with the viewer (dummy until matching is wired). */
  sectionResonance: {
    favoriteArtists: string[];
    coverSongs: string[];
    dreamBands: string[];
    favoriteGenres: string[];
    musicDna: string[];
  } | null;
};
