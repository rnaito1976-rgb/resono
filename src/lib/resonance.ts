const STORAGE_KEY = "resono-resonated";

export const RESONANCE_CHANGE_EVENT = "resono-resonance-change";

export function getResonatedIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function setResonatedIds(ids: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function isResonated(memberId: string): boolean {
  return getResonatedIds().includes(memberId);
}

export function toggleResonance(memberId: string): boolean {
  const ids = getResonatedIds();
  const next = ids.includes(memberId)
    ? ids.filter((id) => id !== memberId)
    : [...ids, memberId];

  setResonatedIds(next);
  window.dispatchEvent(new Event(RESONANCE_CHANGE_EVENT));

  return next.includes(memberId);
}
