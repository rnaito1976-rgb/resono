"use server";

import { revalidatePath } from "next/cache";
import { ensureMemberForUser, getMemberByUserId, updateMember } from "@/lib/members";
import {
  buildMemberFromDialogue,
  enrichMemberFromDiscover,
  isDialogueAnswersComplete,
  type DialogueAnswers,
} from "@/lib/resonance/dialogue";
import { createClient } from "@/lib/supabase/server";

export async function completeDialogueOnboardingAction(
  answers: DialogueAnswers
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "ログインが必要です" };
    }

    if (!isDialogueAnswersComplete(answers)) {
      return { error: "対話が完了していません" };
    }

    let member = await getMemberByUserId(user.id);
    if (!member) {
      member = (await ensureMemberForUser(user.id, user.email)) ?? undefined;
    }

    if (!member) {
      return {
        error:
          "プロフィールの作成に失敗しました。時間をおいて再度お試しください。",
      };
    }

    const updated = buildMemberFromDialogue(member, answers);
    const result = await updateMember(updated);

    if (!result.success) {
      return { error: result.error ?? "保存に失敗しました" };
    }

    revalidatePath("/");
    revalidatePath("/onboarding");
    revalidatePath("/discover");

    return { success: true };
  } catch (error) {
    console.error("[completeDialogueOnboardingAction]", error);
    return { error: "保存中に問題が発生しました。もう一度お試しください。" };
  }
}

export async function completeDiscoverDialogueAction(input: {
  media: string[];
  tempo: string;
  venues: string[];
}) {
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

  const updated = enrichMemberFromDiscover(member, input);

  const result = await updateMember(updated);
  if (!result.success) {
    return { error: result.error ?? "保存に失敗しました" };
  }

  revalidatePath("/");
  revalidatePath("/discover");

  return { success: true };
}
