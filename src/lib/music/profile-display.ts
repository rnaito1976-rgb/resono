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
  favoriteGenres: ["Shoegaze", "Alternative"],
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

function deriveFavoriteGenres(member: Member): string[] {
  const fromGenres = member.music.genres ?? [];
  if (fromGenres.length > 0) {
    return uniqueStrings(fromGenres);
  }

  return uniqueStrings(member.music.playingStyle ?? []);
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
  const favoriteGenres = deriveFavoriteGenres(member);
  const musicDna =
    member.music.musicDna && member.music.musicDna.length > 0
      ? member.music.musicDna
      : deriveMusicDna(member.music.genres);

  return {
    favoriteArtists,
    coverSongs,
    dreamBands,
    favoriteGenres,
    musicDna,
    sectionResonance: options.showResonance ? DEMO_SECTION_RESONANCE : null,
  };
}