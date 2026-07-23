import { createClient } from "@/lib/supabase/server";
import { getMemberById } from "@/lib/members";
import {
  getPartnerId,
  orderedMemberPair,
  type ConversationSummary,
  type MessageRow,
} from "@/lib/messages/types";
import type { Member } from "@/types/member";

function buildSummaries(
  memberId: string,
  conversations: {
    id: string;
    member_a_id: string;
    member_b_id: string;
    created_at: string;
  }[],
  messages: MessageRow[],
  reads: { conversation_id: string; last_read_at: string }[],
  partners: Member[]
): ConversationSummary[] {
  const partnerMap = new Map(partners.map((member) => [member.id, member]));
  const readMap = new Map(reads.map((read) => [read.conversation_id, read.last_read_at]));
  const latestByConversation = new Map<string, MessageRow>();

  for (const message of messages) {
    if (!latestByConversation.has(message.conversation_id)) {
      latestByConversation.set(message.conversation_id, message);
    }
  }

  const unreadByConversation = new Map<string, number>();

  for (const message of messages) {
    if (message.sender_member_id === memberId) {
      continue;
    }

    const lastReadAt = readMap.get(message.conversation_id);
    if (lastReadAt && message.created_at <= lastReadAt) {
      continue;
    }

    unreadByConversation.set(
      message.conversation_id,
      (unreadByConversation.get(message.conversation_id) ?? 0) + 1
    );
  }

  return conversations
    .map((conversation) => {
      const partnerId = getPartnerId(conversation, memberId);
      const partner = partnerMap.get(partnerId);
      if (!partner) {
        return null;
      }

      const lastMessage = latestByConversation.get(conversation.id) ?? null;

      return {
        id: conversation.id,
        partner,
        lastMessage,
        unreadCount: unreadByConversation.get(conversation.id) ?? 0,
        updatedAt: lastMessage?.created_at ?? conversation.created_at,
      };
    })
    .filter((summary): summary is ConversationSummary => summary !== null)
    .sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

export async function getConversationsForMember(
  memberId: string
): Promise<ConversationSummary[]> {
  const supabase = await createClient();

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("id, member_a_id, member_b_id, created_at")
    .or(`member_a_id.eq.${memberId},member_b_id.eq.${memberId}`);

  if (error) {
    console.error("[Supabase] getConversationsForMember:", error.message);
    return [];
  }

  if (!conversations?.length) {
    return [];
  }

  const conversationIds = conversations.map((conversation) => conversation.id);
  const partnerIds = conversations.map((conversation) =>
    getPartnerId(conversation, memberId)
  );

  const [{ data: messages }, { data: reads }, partners] = await Promise.all([
    supabase
      .from("messages")
      .select("*")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("conversation_reads")
      .select("conversation_id, last_read_at")
      .eq("member_id", memberId)
      .in("conversation_id", conversationIds),
    Promise.all(partnerIds.map((id) => getMemberById(id))),
  ]);

  return buildSummaries(
    memberId,
    conversations,
    messages ?? [],
    reads ?? [],
    partners.filter((member): member is Member => Boolean(member))
  );
}

export async function getUnreadCountForMember(memberId: string): Promise<number> {
  const summaries = await getConversationsForMember(memberId);
  return summaries.reduce((total, summary) => total + summary.unreadCount, 0);
}

export async function getConversationById(
  conversationId: string,
  memberId: string
) {
  const supabase = await createClient();

  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();

  if (error || !conversation) {
    return null;
  }

  const isParticipant =
    conversation.member_a_id === memberId ||
    conversation.member_b_id === memberId;

  if (!isParticipant) {
    return null;
  }

  const partnerId = getPartnerId(conversation, memberId);
  const partner = await getMemberById(partnerId);

  if (!partner) {
    return null;
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return {
    conversation,
    partner,
    messages: messages ?? [],
  };
}

export async function getConversationForMembers(
  memberId: string,
  otherMemberId: string
) {
  const [memberAId, memberBId] = orderedMemberPair(memberId, otherMemberId);
  const supabase = await createClient();

  const { data } = await supabase
    .from("conversations")
    .select("id")
    .eq("member_a_id", memberAId)
    .eq("member_b_id", memberBId)
    .maybeSingle();

  return data?.id ?? null;
}

export async function ensureConversationForMembers(
  memberId: string,
  otherMemberId: string
): Promise<string | null> {
  const existingId = await getConversationForMembers(memberId, otherMemberId);
  if (existingId) {
    return existingId;
  }

  const [memberAId, memberBId] = orderedMemberPair(memberId, otherMemberId);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      member_a_id: memberAId,
      member_b_id: memberBId,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return getConversationForMembers(memberId, otherMemberId);
    }

    console.error("[Supabase] ensureConversationForMembers:", error.message);
    return null;
  }

  return data.id;
}

export async function markConversationAsRead(
  conversationId: string,
  memberId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("conversation_reads").upsert(
    {
      conversation_id: conversationId,
      member_id: memberId,
      last_read_at: new Date().toISOString(),
    },
    { onConflict: "conversation_id,member_id" }
  );

  if (error) {
    console.error("[Supabase] markConversationAsRead:", error.message);
  }
}
