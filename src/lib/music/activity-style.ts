export const ACTIVITY_STYLE_OPTIONS = [
  { id: "original", label: "オリジナル" },
  { id: "cover", label: "コピー" },
  { id: "both", label: "どっちも" },
] as const;

export type ActivityStyleId = (typeof ACTIVITY_STYLE_OPTIONS)[number]["id"];

const ACTIVITY_STYLE_ID_SET = new Set<string>(
  ACTIVITY_STYLE_OPTIONS.map((option) => option.id)
);

const ACTIVITY_STYLE_LABEL_BY_ID = Object.fromEntries(
  ACTIVITY_STYLE_OPTIONS.map((option) => [option.id, option.label])
) as Record<ActivityStyleId, string>;

export function isActivityStyleId(value: string): value is ActivityStyleId {
  return ACTIVITY_STYLE_ID_SET.has(value);
}

export function normalizeActivityStyle(
  value: unknown
): ActivityStyleId | undefined {
  if (typeof value !== "string" || !isActivityStyleId(value)) {
    return undefined;
  }

  return value;
}

export function getActivityStyleLabel(
  value: ActivityStyleId | undefined
): string | undefined {
  if (!value) {
    return undefined;
  }

  return ACTIVITY_STYLE_LABEL_BY_ID[value];
}
