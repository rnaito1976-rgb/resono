export function splitList(value: string): string[] {
  return value
    .split(/[,、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinList(items: string[]): string {
  return items.join(", ");
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
