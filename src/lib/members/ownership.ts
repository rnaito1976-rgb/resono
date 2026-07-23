import type { Member } from "@/types/member";

export function isMemberOwnedByUser(
  member: Pick<Member, "id" | "userId">,
  userId: string
): boolean {
  return member.userId === userId || member.id === userId;
}
