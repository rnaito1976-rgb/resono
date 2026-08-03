"use server";

import { revalidatePath } from "next/cache";
import { getMemberByUserId, updateMember } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";

export async function completeIntroOnboardingAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "ログインが必要です" };
    }

    const member = await getMemberByUserId(user.id);
    if (!member) {
      return { error: "プロフィールが見つかりません" };
    }

    const updated = {
      ...member,
      portrait: {
        ...member.portrait,
        introOnboardingPending: false,
        introOnboardingCompleted: true,
      },
    };

    const result = await updateMember(updated);
    if (!result.success) {
      return { error: result.error ?? "保存に失敗しました" };
    }

    revalidatePath("/");
    revalidatePath("/discover");

    return { success: true as const, userId: user.id };
  } catch (error) {
    console.error("[completeIntroOnboardingAction]", error);
    return { error: "保存中に問題が発生しました。もう一度お試しください。" };
  }
}
