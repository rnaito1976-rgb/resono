export function splitList(value: string): string[] {
  return value
    .split(/[,、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinList(items: string[]): string {
  return items.join(", ");
}

/** Parse "Artist - Title" lines used by Live Ritual and cover songs. */
export function parseArtistSongLine(raw: string): { artist?: string; title: string } {
  const trimmed = raw.trim();
  const dashIndex = trimmed.indexOf(" - ");

  if (dashIndex > 0) {
    return {
      artist: trimmed.slice(0, dashIndex).trim(),
      title: trimmed.slice(dashIndex + 3).trim(),
    };
  }

  return { title: trimmed };
}

export function formatArtistSongLine(artist: string | undefined, title: string): string {
  const trimmedArtist = artist?.trim();
  const trimmedTitle = title.trim();

  if (trimmedArtist && trimmedTitle) {
    return `${trimmedArtist} - ${trimmedTitle}`;
  }

  return trimmedTitle || trimmedArtist || "";
}

export function formatInfluenceLabel(item: string): string {
  const colonIndex = item.indexOf(":");
  if (colonIndex === -1) {
    return item;
  }

  const label = item.slice(colonIndex + 1).trim();
  return label || item;
}

export function formatInfluencesForEdit(influences: string[]): string {
  return joinList(influences.map(formatInfluenceLabel));
}
