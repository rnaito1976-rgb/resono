import type { Member } from "@/types/member";
import type { CoverSong, MusicDnaBar, MusicPageView } from "@/types/music-profile";

const DEMO_MUSIC_DNA: MusicDnaBar[] = [
  { label: "Alternative", value: 80 },
  { label: "Indie Rock", value: 60 },
  { label: "Shoegaze", value: 50 },
  { label: "Pop", value: 30 },
];

function uniqueStrings(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

function sharedItems(left: string[], right: string[]): string[] {
  const normalized = new Set(right.map(normalizeToken));
  return uniqueStrings(left.filter((item) => normalized.has(normalizeToken(item))));
}

/** 閲覧者と対象の実データから Music タブの共鳴ポイントを算出 */
export function buildMusicSectionResonance(
  viewer: Member,
  target: Member
): MusicPageView["sectionResonance"] {
  const coverTitles = (member: Member) =>
    uniqueStrings((member.music.coverSongs ?? []).map((song) => song.title));

  const favoriteArtists = sharedItems(
    target.music.favoriteArtists ?? [],
    viewer.music.favoriteArtists ?? []
  );
  const coverSongs = sharedItems(coverTitles(target), coverTitles(viewer));
  const dreamBands = sharedItems(
    target.music.dreamBands ?? [],
    viewer.music.dreamBands ?? []
  );
  const favoriteGenres = sharedItems(target.music.genres ?? [], viewer.music.genres ?? []);
  const musicDna = sharedItems(
    (target.music.musicDna ?? []).map((bar) => bar.label),
    (viewer.music.musicDna ?? []).map((bar) => bar.label)
  );

  if (
    favoriteArtists.length === 0 &&
    coverSongs.length === 0 &&
    dreamBands.length === 0 &&
    favoriteGenres.length === 0 &&
    musicDna.length === 0
  ) {
    return null;
  }

  return { favoriteArtists, coverSongs, dreamBands, favoriteGenres, musicDna };
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
  options: {
    showResonance: boolean;
    sectionResonance?: MusicPageView["sectionResonance"];
  }
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
    sectionResonance: options.showResonance
      ? (options.sectionResonance ?? null)
      : null,
  };
}