"use server";

import { revalidatePath } from "next/cache";
import { ensureConversationForMembers } from "@/lib/messages/conversations";
import { getMemberByUserId } from "@/lib/members";
import { resolveCurrentMemberId } from "@/lib/members/resolve";
import {
  getResonanceStatusForMember,
  type ResonanceStatus,
} from "@/lib/resonance/status";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type { ResonanceStatus };

export async function getResonanceStatusAction(
  targetMemberId: string
): Promise<ResonanceStatus> {
  if (!isSupabaseConfigured()) {
    return { isResonated: false, isMutual: false, conversationId: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isResonated: false, isMutual: false, conversationId: null };
  }

  const memberId = await resolveCurrentMemberId();
  if (!memberId || memberId === targetMemberId) {
    return { isResonated: false, isMutual: false, conversationId: null };
  }

  const status = await getResonanceStatusForMember(memberId, targetMemberId);

  if (status.isMutual && !status.conversationId) {
    const conversationId = await ensureConversationForMembers(
      memberId,
      targetMemberId
    );
    return { ...status, conversationId };
  }

  return status;
}

export async function toggleResonanceAction(targetMemberId: string) {
  if (!isSupabaseConfigured()) {
    return {
      error: "Supabaseが設定されていません。",
      isResonated: false,
      isMutual: false,
      conversationId: null as string | null,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "ログインが必要です。",
      isResonated: false,
      isMutual: false,
      conversationId: null as string | null,
    };
  }

  const memberId = await resolveCurrentMemberId();
  if (!memberId) {
    return {
      error: "プロフィールが見つかりません。",
      isResonated: false,
      isMutual: false,
      conversationId: null as string | null,
    };
  }

  if (memberId === targetMemberId) {
    return {
      error: "自分自身には共鳴できません。",
      isResonated: false,
      isMutual: false,
      conversationId: null as string | null,
    };
  }

  const { data: existing } = await supabase
    .from("resonances")
    .select("id")
    .eq("from_member_id", memberId)
    .eq("to_member_id", targetMemberId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("resonances")
      .delete()
      .eq("id", existing.id);

    if (error) {
      return {
        error: error.message,
        isResonated: true,
        isMutual: false,
        conversationId: null as string | null,
      };
    }

    revalidatePath("/");
    revalidatePath(`/member/${targetMemberId}`);
    revalidatePath(`/member/${memberId}`);
    revalidatePath("/messages");

    return {
      isResonated: false,
      isMutual: false,
      conversationId: null as string | null,
    };
  }

  const { error: insertError } = await supabase.from("resonances").insert({
    from_member_id: memberId,
    to_member_id: targetMemberId,
  });

  if (insertError) {
    return {
      error: insertError.message,
      isResonated: false,
      isMutual: false,
      conversationId: null as string | null,
    };
  }

  const { data: reverse } = await supabase
    .from("resonances")
    .select("id")
    .eq("from_member_id", targetMemberId)
    .eq("to_member_id", memberId)
    .maybeSingle();

  const isMutual = Boolean(reverse);
  const conversationId = isMutual
    ? await ensureConversationForMembers(memberId, targetMemberId)
    : null;

  revalidatePath("/");
  revalidatePath(`/member/${targetMemberId}`);
  revalidatePath("/messages");

  return {
    isResonated: true,
    isMutual,
    conversationId,
  };
}

export async function getUnreadCountAction(): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  const member = await getMemberByUserId(user.id);
  if (!member) {
    return 0;
  }

  const { getUnreadCountForMember } = await import("@/lib/messages/conversations");
  return getUnreadCountForMember(member.id);
}
