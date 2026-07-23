"use server";

import { revalidatePath } from "next/cache";
import {
  markConversationAsRead,
} from "@/lib/messages/conversations";
import { getMemberByUserId } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function sendMessageAction(conversationId: string, body: string) {
  const trimmed = body.trim();

  if (!trimmed) {
    return { error: "メッセージを入力してください。" };
  }

  if (trimmed.length > 2000) {
    return { error: "メッセージは2000文字以内で入力してください。" };
  }

  if (!isSupabaseConfigured()) {
    return { error: "Supabaseが設定されていません。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です。" };
  }

  const member = await getMemberByUserId(user.id);
  if (!member) {
    return { error: "プロフィールが見つかりません。" };
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, member_a_id, member_b_id")
    .eq("id", conversationId)
    .maybeSingle();

  if (
    !conversation ||
    (conversation.member_a_id !== member.id &&
      conversation.member_b_id !== member.id)
  ) {
    return { error: "会話が見つかりません。" };
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_member_id: member.id,
      body: trimmed,
    })
    .select("*")
    .single();

  if (error) {
    return { error: error.message };
  }

  await markConversationAsRead(conversationId, member.id);

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);

  return { message: data };
}

export async function markConversationReadAction(conversationId: string) {
  if (!isSupabaseConfigured()) {
    return { success: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false };
  }

  const member = await getMemberByUserId(user.id);
  if (!member) {
    return { success: false };
  }

  await markConversationAsRead(conversationId, member.id);
  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);

  return { success: true };
}
