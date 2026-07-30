export const PROFILE_GROW_NONE_LABEL = "特になし";

export function isProfileGrowNoneLabel(value: string): boolean {
  return value.trim() === PROFILE_GROW_NONE_LABEL;
}

export function applyNoneAwareSelection(selected: string[], value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) {
    return selected;
  }

  if (isProfileGrowNoneLabel(trimmed)) {
    return selected.some(isProfileGrowNoneLabel) ? [] : [PROFILE_GROW_NONE_LABEL];
  }

  const withoutNone = selected.filter((item) => !isProfileGrowNoneLabel(item));
  const key = trimmed.toLowerCase();

  if (withoutNone.some((item) => item.trim().toLowerCase() === key)) {
    return withoutNone.filter((item) => item.trim().toLowerCase() !== key);
  }

  return [...withoutNone, trimmed];
}
