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

const INTERNAL_INFLUENCE_PREFIXES = new Set([
  "バンド",
  "活動",
  "スタイル",
  "メンバー",
  "会話",
]);

export function formatInfluenceLabel(item: string): string {
  const colonIndex = item.indexOf(":");
  if (colonIndex === -1) {
    return item;
  }

  const label = item.slice(colonIndex + 1).trim();
  return label || item;
}

function isInternalInfluence(item: string): boolean {
  const colonIndex = item.indexOf(":");
  if (colonIndex === -1) {
    return false;
  }

  return INTERNAL_INFLUENCE_PREFIXES.has(item.slice(0, colonIndex));
}

/** Values 編集用。対話由来の内部プレフィックスは除外する。 */
export function formatInfluencesForEdit(influences: string[]): string {
  const publicValues = influences
    .filter((item) => !isInternalInfluence(item))
    .map(formatInfluenceLabel)
    .filter(Boolean);

  return joinList(publicValues);
}

/** Values 保存時に内部シグナル用 influences を残す。 */
export function mergePublicInfluences(
  current: string[],
  publicRaw: string
): string[] {
  const internal = current.filter(isInternalInfluence);
  const nextPublic = splitList(publicRaw).map((item) =>
    item.includes(":") ? item : `大切:${item}`
  );

  return [...new Set([...internal, ...nextPublic])];
}
