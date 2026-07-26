import type { Member } from "@/types/member";
import type { CoverSong, MusicDnaBar, MusicPageView } from "@/types/music-profile";

const DEMO_MUSIC_DNA: MusicDnaBar[] = [
  { label: "Alternative", value: 80 },
  { label: "Indie Rock", value: 60 },
  { label: "Shoegaze", value: 50 },
  { label: "Pop", value: 30 },
];

const DEMO_SECTION_RESONANCE = {
  favoriteArtists: ["Radiohead"],
  coverSongs: ["No Surprises"],
  dreamBands: ["羊文学"],
  playingStyle: ["空間系ギター"],
  musicDna: ["Alternative"],
};

function uniqueStrings(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function deriveMusicDna(genres: string[]): MusicDnaBar[] {
  if (genres.length === 0) {
    return DEMO_MUSIC_DNA;
  }

  return genres.slice(0, 5).map((genre, index) => ({
    label: genre,
    value: Math.max(35, 85 - index * 12),
  }));
}

function derivePlayingStyle(member: Member): string[] {
  const fromProfile = member.music.playingStyle ?? [];
  if (fromProfile.length > 0) {
    return fromProfile;
  }

  const fromGenres = member.music.genres.slice(0, 4);
  const fromMood = member.music.listeningMood ? [member.music.listeningMood] : [];

  return uniqueStrings([...fromGenres, ...fromMood]);
}

function resolveCoverSongs(member: Member): CoverSong[] {
  return member.music.coverSongs ?? [];
}

function resolveDreamBands(member: Member): string[] {
  const stored = member.music.dreamBands ?? [];
  if (stored.length > 0) {
    return stored;
  }

  return member.music.favoriteArtists.slice(0, 4);
}

export function buildMusicPageView(
  member: Member,
  options: { showResonance: boolean }
): MusicPageView {
  const favoriteArtists = uniqueStrings(member.music.favoriteArtists);
  const coverSongs = resolveCoverSongs(member);
  const dreamBands = uniqueStrings(resolveDreamBands(member));
  const playingStyle = uniqueStrings(derivePlayingStyle(member));
  const musicDna =
    member.music.musicDna && member.music.musicDna.length > 0
      ? member.music.musicDna
      : deriveMusicDna(member.music.genres);

  return {
    favoriteArtists,
    coverSongs,
    dreamBands,
    playingStyle,
    musicDna,
    sectionResonance: options.showResonance ? DEMO_SECTION_RESONANCE : null,
  };
}