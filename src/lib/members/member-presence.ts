import type { Member } from "@/types/member";

export type MemberPresenceKind = "recruiting" | "seeking_friends" | "open_to_band";

export const MEMBER_PRESENCE_LABELS: Record<MemberPresenceKind, string> = {
  recruiting: "メンバー募集中",
  seeking_friends: "活動中",
  open_to_band: "これから始める",
};

export function getMemberPresenceKind(member: Member): MemberPresenceKind {
  if (member.lookingFor.parts.some(Boolean)) {
    return "recruiting";
  }

  if (
    member.lookingFor.bandVision?.trim() ||
    member.lookingFor.commitment?.trim() ||
    member.music.activityStyle
  ) {
    return "seeking_friends";
  }

  return "open_to_band";
}

export function getMemberPresenceLabel(member: Member): string {
  return MEMBER_PRESENCE_LABELS[getMemberPresenceKind(member)];
}
