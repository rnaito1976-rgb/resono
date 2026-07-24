import { orderedMemberPair } from "@/lib/messages/types";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type ResonanceStatus = {
  isResonated: boolean;
  isMutual: boolean;
  conversationId: string | null;
};

const EMPTY_STATUS: ResonanceStatus = {
  isResonated: false,
  isMutual: false,
  conversationId: null,
};

export async function getConversationIdsForMemberPairs(
  viewerMemberId: string,
  otherMemberIds: string[]
): Promise<Map<string, string>> {
  if (!isSupabaseConfigured() || otherMemberIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient();
  const uniqueIds = [...new Set(otherMemberIds)];
  const orClauses = uniqueIds
    .map((otherId) => {
      const [memberAId, memberBId] = orderedMemberPair(viewerMemberId, otherId);
      return `and(member_a_id.eq.${memberAId},member_b_id.eq.${memberBId})`;
    })
    .join(",");

  const { data, error } = await supabase
    .from("conversations")
    .select("id, member_a_id, member_b_id")
    .or(orClauses);

  if (error) {
    console.error("[Supabase] getConversationIdsForMemberPairs:", error.message);
    return new Map();
  }

  const map = new Map<string, string>();

  for (const conversation of data ?? []) {
    const partnerId =
      conversation.member_a_id === viewerMemberId
        ? conversation.member_b_id
        : conversation.member_a_id;
    map.set(partnerId, conversation.id);
  }

  return map;
}

export async function getResonanceStatusBatch(
  viewerMemberId: string,
  targetMemberIds: string[]
): Promise<Record<string, ResonanceStatus>> {
  if (!isSupabaseConfigured()) {
    return {};
  }

  const uniqueTargets = [
    ...new Set(targetMemberIds.filter((id) => id && id !== viewerMemberId)),
  ];

  if (uniqueTargets.length === 0) {
    return {};
  }

  const supabase = await createClient();
  const [{ data: outgoing }, { data: incoming }] = await Promise.all([
    supabase
      .from("resonances")
      .select("to_member_id")
      .eq("from_member_id", viewerMemberId)
      .in("to_member_id", uniqueTargets),
    supabase
      .from("resonances")
      .select("from_member_id")
      .eq("to_member_id", viewerMemberId)
      .in("from_member_id", uniqueTargets),
  ]);

  const outgoingSet = new Set((outgoing ?? []).map((row) => row.to_member_id));
  const incomingSet = new Set((incoming ?? []).map((row) => row.from_member_id));
  const mutualIds = uniqueTargets.filter(
    (id) => outgoingSet.has(id) && incomingSet.has(id)
  );
  const conversationMap = await getConversationIdsForMemberPairs(
    viewerMemberId,
    mutualIds
  );

  return Object.fromEntries(
    uniqueTargets.map((targetId) => {
      const isResonated = outgoingSet.has(targetId);
      const isMutual = isResonated && incomingSet.has(targetId);

      return [
        targetId,
        {
          isResonated,
          isMutual,
          conversationId: isMutual
            ? (conversationMap.get(targetId) ?? null)
            : null,
        } satisfies ResonanceStatus,
      ];
    })
  );
}

export async function getResonanceStatusForMember(
  viewerMemberId: string,
  targetMemberId: string
): Promise<ResonanceStatus> {
  if (viewerMemberId === targetMemberId) {
    return EMPTY_STATUS;
  }

  const batch = await getResonanceStatusBatch(viewerMemberId, [targetMemberId]);
  return batch[targetMemberId] ?? EMPTY_STATUS;
}
