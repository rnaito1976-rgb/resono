import { formatArtistSongLine, parseArtistSongLine } from "@/lib/form";
import type { CoverSong } from "@/types/music-profile";

export function createEmptyCoverSong(
  memberId: string,
  seed?: number | string,
  idPrefix = "cover"
): CoverSong {
  const suffix = seed ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    id: `${idPrefix}-${memberId}-${suffix}`,
    title: "",
    artist: "",
  };
}

export function getCoverSongsForEditor(
  songs: CoverSong[] | undefined,
  memberId: string,
  idPrefix = "cover"
): CoverSong[] {
  if (songs && songs.length > 0) {
    return songs;
  }

  return [createEmptyCoverSong(memberId, 0, idPrefix)];
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

export function coverSongsToEditLines(songs: CoverSong[] | undefined): string[] {
  if (!songs?.length) {
    return [""];
  }

  return songs.map(formatCoverSongForEdit);
}

export function editLinesToCoverSongs(
  lines: string[],
  memberId: string,
  existingSongs: CoverSong[] = [],
  idPrefix = "cover"
): CoverSong[] | undefined {
  const songs = lines
    .map((line, index) => {
      const existing = existingSongs[index] ?? createEmptyCoverSong(memberId, index, idPrefix);
      return parseCoverSongFromEdit(line, existing);
    })
    .filter(hasCoverSongContent);

  return songs.length > 0 ? songs : undefined;
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
