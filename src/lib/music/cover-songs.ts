import { formatArtistSongLine, parseArtistSongLine } from "@/lib/form";
import type { CoverSong } from "@/types/music-profile";

export function createEmptyCoverSong(memberId: string, seed?: number | string): CoverSong {
  const suffix = seed ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    id: `cover-${memberId}-${suffix}`,
    title: "",
    artist: "",
  };
}

export function getCoverSongsForEditor(
  songs: CoverSong[] | undefined,
  memberId: string
): CoverSong[] {
  if (songs && songs.length > 0) {
    return songs;
  }

  return [createEmptyCoverSong(memberId, 0)];
}

export function formatCoverSongForEdit(song: CoverSong): string {
  return formatArtistSongLine(song.artist, song.title);
}

export function parseCoverSongFromEdit(raw: string, existing: CoverSong): CoverSong {
  const parsed = parseArtistSongLine(raw);

  return {
    ...existing,
    artist: parsed.artist ?? "",
    title: parsed.title,
  };
}

export function hasCoverSongContent(song: CoverSong): boolean {
  return Boolean(song.title.trim() || song.artist.trim());
}

export function sanitizeCoverSongs(
  songs: CoverSong[] | undefined
): CoverSong[] | undefined {
  if (!songs?.length) {
    return undefined;
  }

  const next = songs
    .map((song) => ({
      ...song,
      title: song.title.trim(),
      artist: song.artist.trim(),
    }))
    .filter((song) => song.title || song.artist)
    .map((song) =>
      song.title
        ? song
        : {
            ...song,
            title: song.artist,
            artist: "",
          }
    );

  return next.length > 0 ? next : undefined;
}

export function updateCoverSongFromEdit(
  songs: CoverSong[],
  index: number,
  raw: string
): CoverSong[] {
  return songs.map((song, songIndex) =>
    songIndex === index ? parseCoverSongFromEdit(raw, song) : song
  );
}

export function addCoverSongRow(songs: CoverSong[], memberId: string): CoverSong[] {
  return [...songs, createEmptyCoverSong(memberId)];
}

export function removeCoverSongRow(songs: CoverSong[], index: number): CoverSong[] {
  return songs.filter((_, songIndex) => songIndex !== index);
}
