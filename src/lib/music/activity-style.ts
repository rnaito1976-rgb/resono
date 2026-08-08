import type { MemberMusicProfile } from "@/types/music-profile";

export const ACTIVITY_STYLE_OPTIONS = [
  { id: "original", label: "オリジナル" },
  { id: "cover", label: "コピー" },
] as const;

export type ActivityStyleId = (typeof ACTIVITY_STYLE_OPTIONS)[number]["id"];

const ACTIVITY_STYLE_ID_SET = new Set<string>(
  ACTIVITY_STYLE_OPTIONS.map((option) => option.id)
);

const ACTIVITY_STYLE_LABEL_BY_ID = Object.fromEntries(
  ACTIVITY_STYLE_OPTIONS.map((option) => [option.id, option.label])
) as Record<ActivityStyleId, string>;

const LEGACY_BOTH_ID = "both";

export function isActivityStyleId(value: string): value is ActivityStyleId {
  return ACTIVITY_STYLE_ID_SET.has(value);
}

export function normalizeActivityStyles(
  styles: unknown,
  legacySingle?: unknown
): ActivityStyleId[] {
  const fromArray = Array.isArray(styles)
    ? styles.filter((item): item is ActivityStyleId => isActivityStyleId(String(item)))
    : [];

  if (fromArray.length > 0) {
    return [...new Set(fromArray)];
  }

  if (typeof legacySingle !== "string" || !legacySingle.trim()) {
    return [];
  }

  if (legacySingle === LEGACY_BOTH_ID) {
    return ["original", "cover"];
  }

  if (isActivityStyleId(legacySingle)) {
    return [legacySingle];
  }

  return [];
}

export function getMemberActivityStyles(
  music: Pick<MemberMusicProfile, "activityStyle" | "activityStyles">
): ActivityStyleId[] {
  return normalizeActivityStyles(music.activityStyles, music.activityStyle);
}

export function getActivityStyleLabel(value: ActivityStyleId | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return ACTIVITY_STYLE_LABEL_BY_ID[value];
}

export function getActivityStyleLabels(styles: ActivityStyleId[]): string[] {
  return styles
    .map((style) => ACTIVITY_STYLE_LABEL_BY_ID[style])
    .filter((label): label is string => Boolean(label));
}

export function formatActivityStyleLabels(
  music: Pick<MemberMusicProfile, "activityStyle" | "activityStyles">,
  separator = " / "
): string | null {
  const labels = getActivityStyleLabels(getMemberActivityStyles(music));
  return labels.length > 0 ? labels.join(separator) : null;
}

/** @deprecated Use normalizeActivityStyles / getMemberActivityStyles instead. */
export function normalizeActivityStyle(value: unknown): ActivityStyleId | undefined {
  const [first] = normalizeActivityStyles(undefined, value);
  return first;
}
