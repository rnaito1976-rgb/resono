import { parseArtistSongLine } from "@/lib/form";
import { hasCoverSongContent } from "@/lib/music/cover-songs";
import type { Member } from "@/types/member";

export type CoverSongEntry = {
  artist: string;
  title: string;
};

export function normalizeCoverSongKey(artist: string, title: string): string {
  return `${artist.trim().toLowerCase()}::${title.trim().toLowerCase()}`;
}

export function collectMemberCoverSongEntries(member: Member): CoverSongEntry[] {
  const seen = new Set<string>();
  const entries: CoverSongEntry[] = [];

  function push(artist: string, title: string) {
    const normalizedArtist = artist.trim();
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      return;
    }

    const key = normalizeCoverSongKey(normalizedArtist, normalizedTitle);
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    entries.push({ artist: normalizedArtist, title: normalizedTitle });
  }

  for (const song of member.music.coverSongs ?? []) {
    if (hasCoverSongContent(song)) {
      push(song.artist, song.title);
    }
  }

  for (const line of member.lookingFor.setList ?? []) {
    const parsed = parseArtistSongLine(line);
    push(parsed.artist ?? "", parsed.title);
  }

  return entries;
}

export function filterNewCoverSongEntries(
  candidates: CoverSongEntry[],
  existing: CoverSongEntry[]
): CoverSongEntry[] {
  const existingKeys = new Set(
    existing.map((song) => normalizeCoverSongKey(song.artist, song.title))
  );

  return candidates.filter(
    (song) => !existingKeys.has(normalizeCoverSongKey(song.artist, song.title))
  );
}
