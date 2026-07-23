import type { Tables } from "@/types/database";
import type { Member } from "@/types/member";

export type MessageRow = Tables<"messages">;
export type ConversationRow = Tables<"conversations">;

export type ConversationSummary = {
  id: string;
  partner: Member;
  lastMessage: MessageRow | null;
  unreadCount: number;
  updatedAt: string;
};

export function orderedMemberPair(
  memberA: string,
  memberB: string
): [string, string] {
  return memberA < memberB ? [memberA, memberB] : [memberB, memberA];
}

export function getPartnerId(
  conversation: Pick<ConversationRow, "member_a_id" | "member_b_id">,
  memberId: string
): string {
  return conversation.member_a_id === memberId
    ? conversation.member_b_id
    : conversation.member_a_id;
}
