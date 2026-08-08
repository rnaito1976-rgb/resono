import {
  getMemberActivityStyles,
  getActivityStyleLabels,
} from "@/lib/music/activity-style";
import { getPlayingParts } from "@/lib/resonance/dialogue";
import type { Member } from "@/types/member";

function uniqueNonEmpty(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const trimmed = item.trim();
    if (!trimmed) {
      continue;
    }

    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

/** Compact music identity lines for cards (artists, genres, styles). */
export function buildMemberMusicHints(member: Member, maxItems = 4): string[] {
  const playingStyle = member.music.playingStyle?.[0];
  const activityStyleLabels = getActivityStyleLabels(getMemberActivityStyles(member.music));

  return uniqueNonEmpty([
    ...member.music.favoriteArtists.slice(0, 2),
    ...(member.music.genres ?? []).slice(0, 2),
    ...(playingStyle ? [playingStyle] : []),
    ...activityStyleLabels,
  ]).slice(0, maxItems);
}

export function buildMemberCardMeta(member: Member): string[] {
  const parts = getPlayingParts(member);
  const location = member.portrait.location?.trim();
  const lines: string[] = [];

  if (parts.length > 0) {
    lines.push(parts.join(" · "));
  }

  if (location) {
    lines.push(location);
  }

  return lines;
}

/** Compact "Part / Area" line for list-style layouts. */
export function buildMemberPartsLocationLine(member: Member): string | null {
  const parts = getPlayingParts(member);
  const location = member.portrait.location?.trim();
  const segments = [...parts, ...(location ? [location] : [])];

  return segments.length > 0 ? segments.join(" / ") : null;
}

/** Favorite artists joined for scan-friendly list rows. */
export function buildMemberArtistLine(member: Member, max = 2): string | null {
  const artists = member.music.favoriteArtists
    .map((artist) => artist.trim())
    .filter(Boolean)
    .slice(0, max);

  return artists.length > 0 ? artists.join(" / ") : null;
}

export function buildMemberPlayingStyleLine(member: Member): string | null {
  const style = member.music.playingStyle?.[0]?.trim();
  return style || null;
}

export function memberMatchesArtist(member: Member, artist: string): boolean {
  const needle = artist.trim().toLowerCase();
  if (!needle) {
    return false;
  }

  const haystacks = [
    ...member.music.favoriteArtists,
    ...member.portrait.influences,
    ...(member.music.dreamBands ?? []),
  ];

  return haystacks.some((value) => value.trim().toLowerCase().includes(needle));
}

export function collectArtistFilters(members: Member[], limit = 10): string[] {
  const counts = new Map<string, number>();

  for (const member of members) {
    for (const artist of member.music.favoriteArtists) {
      const trimmed = artist.trim();
      if (!trimmed) {
        continue;
      }

      counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "ja"))
    .slice(0, limit)
    .map(([artist]) => artist);
}
