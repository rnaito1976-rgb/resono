import type { Member } from "@/types/member";

export type MemberPresenceKind = "recruiting" | "seeking_friends" | "open_to_band";

export const MEMBER_PRESENCE_LABELS: Record<MemberPresenceKind, string> = {
  recruiting: "メンバー募集中",
  seeking_friends: "音楽仲間を探している",
  open_to_band: "いい人がいたらバンドしたい",
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
