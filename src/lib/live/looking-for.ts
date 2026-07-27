import type { Member } from "@/types/member";

function normalizeList(values: string[]): string {
  return [...values]
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join("|");
}

/** True when Looking For fields meaningfully changed. */
export function hasLookingForChanged(before: Member, after: Member): boolean {
  const a = before.lookingFor;
  const b = after.lookingFor;

  return (
    normalizeList(a.parts) !== normalizeList(b.parts) ||
    a.bandVision.trim() !== b.bandVision.trim() ||
    a.commitment.trim() !== b.commitment.trim() ||
    normalizeList(a.setList ?? []) !== normalizeList(b.setList ?? []) ||
    normalizeList(a.liveHistory ?? []) !== normalizeList(b.liveHistory ?? [])
  );
}
