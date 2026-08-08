export type MembersViewMode = "card" | "list";

const STORAGE_KEY = "resono:members-view-mode";

export function readMembersViewMode(): MembersViewMode | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "card" || value === "list") {
      return value;
    }
  } catch {
    // ignore quota / private mode
  }

  return null;
}

export function writeMembersViewMode(mode: MembersViewMode): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // ignore quota / private mode
  }
}
