"use server";

import { revalidatePath } from "next/cache";
import { isValidFrequencyColor } from "@/lib/frequency-color/palette";
import { saveFrequencyColorForUser } from "@/lib/frequency-color/server";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { ensureMemberForUser, getMemberByUserId, updateMember } from "@/lib/members";
import { invalidateResonanceCacheForMember } from "@/lib/resonance/cache";
import {
  buildMemberFromDialogue,
  enrichMemberFromDiscover,
  isDialogueAnswersComplete,
  type DialogueAnswers,
} from "@/lib/resonance/dialogue";
import { applyProfileAiComment } from "@/lib/profile/ai-comment";
import {
  buildItemFromConversationAnswer,
  PROFILE_CONVERSATION_STEPS,
  setProfileItem,
  syncMemberFromProfileItems,
} from "@/lib/profile/items";
import {
  buildMemberFromMinimalRegistration,
  isMinimalRegistrationInputComplete,
  type MinimalRegistrationInput,
} from "@/lib/profile/registration";
import { NO_PHOTO_URL } from "@/lib/onboarding/status";
import { createClient } from "@/lib/supabase/server";
import type { WelcomeOnboardingAnswers } from "@/types/welcome-onboarding";
import { effectiveWelcomeParts } from "@/lib/welcome/onboarding-registration";

export async function completeMinimalRegistrationAction(
  input: Partial<MinimalRegistrationInput>
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "ログインが必要です" };
    }

    if (!isMinimalRegistrationInputComplete(input)) {
      return { error: "必要な項目をすべて入力してください" };
    }

    let member = await getMemberByUserId(user.id);
    if (!member) {
      member = (await ensureMemberForUser(user.id, user.email)) ?? undefined;
    }

    if (!member) {
      return { error: "プロフィールの作成に失敗しました。時間をおいて再度お試しください。" };
    }

    const updated = buildMemberFromMinimalRegistration(member, input);
    const result = await updateMember(updated);

    if (!result.success) {
      return { error: result.error ?? "保存に失敗しました" };
    }

    void invalidateResonanceCacheForMember(member.id);

    void import("@/lib/live/events").then(({ publishLiveEvent }) =>
      publishLiveEvent({
        kind: "new_member",
        title: updated.name,
        subtitle: "コミュニティに参加しました",
        href: `/member/${updated.id}`,
        photo: updated.photo,
        actorMemberId: updated.id,
      })
    );

    revalidatePath("/");
    revalidatePath("/onboarding");
    revalidatePath("/discover");
    revalidatePath(`/member/${member.id}`);

    return { success: true };
  } catch (error) {
    console.error("[completeMinimalRegistrationAction]", error);
    return { error: "保存中に問題が発生しました。もう一度お試しください。" };
  }
}

/** @deprecated 旧9ステップ対話。既存データ互換のため残置 */
export async function completeDialogueOnboardingAction(answers: DialogueAnswers) {
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
      return { error: "先にプロフィール登録を完了してください" };
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

export async function startResonoFromWelcomeAction(
  answers: WelcomeOnboardingAnswers
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "ログインが必要です" };
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

    const parts = effectiveWelcomeParts(answers.parts);
    const input: MinimalRegistrationInput = {
      name: member.name.trim() || "Member",
      photo: NO_PHOTO_URL,
      part: parts[0] ?? "",
      parts,
      favoriteArtists: answers.artists,
      sounds: answers.sounds,
    };

    const registrationResult = await completeMinimalRegistrationAction(input);
    if (registrationResult.error) {
      return registrationResult;
    }

    if (answers.frequencyColor && isValidFrequencyColor(answers.frequencyColor)) {
      const colorResult = await saveFrequencyColorAction(answers.frequencyColor);
      if (colorResult.error) {
        return colorResult;
      }

      return { success: true, redirectTo: "/" as const };
    }

    return {
      success: true,
      redirectTo: "/onboarding?skipPhoto=1&phase=frequency" as const,
    };
  } catch (error) {
    console.error("[startResonoFromWelcomeAction]", error);
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

export async function addProfileItemFromConversationAction(
  stepId: string,
  answer: string
) {
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

  const step = PROFILE_CONVERSATION_STEPS.find((item) => item.id === stepId);
  if (!step) {
    return { error: "質問が見つかりません" };
  }

  const trimmed = answer.trim();
  if (!trimmed) {
    return { error: "回答を入力してください" };
  }

  const item = buildItemFromConversationAnswer(step, trimmed);
  const updated = applyProfileAiComment(
    syncMemberFromProfileItems(setProfileItem(member, item))
  );
  const result = await updateMember(updated);

  if (!result.success) {
    return { error: result.error ?? "保存に失敗しました" };
  }

  void invalidateResonanceCacheForMember(member.id);

  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath(`/member/${member.id}`);
  revalidatePath(`/member/${member.id}/edit`);

  return { success: true, item };
}

/** @deprecated use addProfileItemFromConversationAction */
export async function addProfileCardFromConversationAction(
  stepId: string,
  answer: string
) {
  return addProfileItemFromConversationAction(stepId, answer);
}

/** @deprecated 旧 discover 対話 */
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
