"use server";

import { revalidatePath } from "next/cache";
import { isValidFrequencyColor } from "@/lib/frequency-color/palette";
import { saveFrequencyColorForUser } from "@/lib/frequency-color/server";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
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

export async function saveFrequencyColorAction(color: FrequencyColorHex) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "ログインが必要です" };
    }

    if (!isValidFrequencyColor(color)) {
      return { error: "無効なカラーです" };
    }

    const member = await getMemberByUserId(user.id);
    if (!member || !member.portrait.dialogueCompleted) {
      return { error: "先にオンボーディングの対話を完了してください" };
    }

    const result = await saveFrequencyColorForUser(user.id, color);
    if (!result.success) {
      return { error: result.error ?? "保存に失敗しました" };
    }

    revalidatePath("/");
    revalidatePath("/me");
    revalidatePath("/onboarding");
    revalidatePath("/discover");
    revalidatePath("/messages");
    revalidatePath("/bands");

    if (member.id) {
      revalidatePath(`/member/${member.id}`);
      revalidatePath(`/member/${member.id}/edit`);
    }

    return { success: true };
  } catch (error) {
    console.error("[saveFrequencyColorAction]", error);
    return { error: "保存中に問題が発生しました。もう一度お試しください。" };
  }
}

export async function completeOnboardingWithFrequencyAction(
  answers: DialogueAnswers,
  color: FrequencyColorHex
) {
  const dialogueResult = await completeDialogueOnboardingAction(answers);
  if (dialogueResult.error) {
    return dialogueResult;
  }

  return saveFrequencyColorAction(color);
}

export async function completeDiscoverDialogueAction(input: {
  artists: string[];
  tempo: string;
  values: string[];
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
