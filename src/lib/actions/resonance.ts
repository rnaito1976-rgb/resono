"use server";

import { revalidatePath } from "next/cache";
import { ensureConversationForMembers } from "@/lib/messages/conversations";
import { getMemberByUserId } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type ResonanceStatus = {
  isResonated: boolean;
  isMutual: boolean;
  conversationId: string | null;
};

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

  const member = await getMemberByUserId(user.id);
  if (!member || member.id === targetMemberId) {
    return { isResonated: false, isMutual: false, conversationId: null };
  }

  const [{ data: outgoing }, { data: incoming }] = await Promise.all([
    supabase
      .from("resonances")
      .select("id")
      .eq("from_member_id", member.id)
      .eq("to_member_id", targetMemberId)
      .maybeSingle(),
    supabase
      .from("resonances")
      .select("id")
      .eq("from_member_id", targetMemberId)
      .eq("to_member_id", member.id)
      .maybeSingle(),
  ]);

  const isResonated = Boolean(outgoing);
  const isMutual = Boolean(outgoing && incoming);
  const conversationId = isMutual
    ? await ensureConversationForMembers(member.id, targetMemberId)
    : null;

  return { isResonated, isMutual, conversationId };
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

  const member = await getMemberByUserId(user.id);
  if (!member) {
    return {
      error: "プロフィールが見つかりません。",
      isResonated: false,
      isMutual: false,
      conversationId: null as string | null,
    };
  }

  if (member.id === targetMemberId) {
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
    .eq("from_member_id", member.id)
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
    revalidatePath("/messages");

    return {
      isResonated: false,
      isMutual: false,
      conversationId: null as string | null,
    };
  }

  const { error: insertError } = await supabase.from("resonances").insert({
    from_member_id: member.id,
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
    .eq("to_member_id", member.id)
    .maybeSingle();

  const isMutual = Boolean(reverse);
  const conversationId = isMutual
    ? await ensureConversationForMembers(member.id, targetMemberId)
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
