"use server";

import {
  type FeedbackCategory,
  sendFeedbackEmail,
} from "@/lib/feedback/send-feedback-email";
import { MENU_FEEDBACK } from "@/lib/menu/copy";
import { getMemberByUserId } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";

const VALID_CATEGORIES = new Set<FeedbackCategory>(
  MENU_FEEDBACK.categories.map((item) => item.id)
);

export async function submitFeedbackAction(input: {
  category: FeedbackCategory;
  message: string;
}) {
  try {
    if (!VALID_CATEGORIES.has(input.category)) {
      return { error: "カテゴリを選択してください" };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "ログインが必要です" };
    }

    const member = await getMemberByUserId(user.id);

    return sendFeedbackEmail({
      category: input.category,
      message: input.message,
      memberName: member?.name,
      memberEmail: user.email ?? undefined,
      memberId: member?.id,
    });
  } catch (error) {
    console.error("[submitFeedbackAction]", error);
    return { error: "送信中に問題が発生しました。もう一度お試しください。" };
  }
}
