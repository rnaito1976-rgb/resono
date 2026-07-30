"use server";

import { revalidatePath } from "next/cache";
import { isValidFrequencyColor } from "@/lib/frequency-color/palette";
import { saveFrequencyColorForUser } from "@/lib/frequency-color/server";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { getMemberByUserId, updateMember } from "@/lib/members";
import { resolveCurrentMemberId } from "@/lib/members/resolve";
import { invalidateResonanceCacheForMember } from "@/lib/resonance/cache";
import { PLAYING_PART_OPTIONS } from "@/lib/resonance/dialogue";
import { getAuthUser } from "@/lib/supabase/auth";
import type { Member } from "@/types/member";

function revalidateMemberPaths(memberId: string) {
  revalidatePath("/");
  revalidatePath("/me");
  revalidatePath(`/member/${memberId}`);
  revalidatePath(`/member/${memberId}/edit`);
}

export async function updateFrequencyColorAction(color: FrequencyColorHex) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { error: "ログインが必要です" };
    }

    if (!isValidFrequencyColor(color)) {
      return { error: "無効なカラーです" };
    }

    const memberId = await resolveCurrentMemberId();
    if (!memberId) {
      return { error: "プロフィールが見つかりません" };
    }

    const result = await saveFrequencyColorForUser(user.id, color);
    if (!result.success) {
      return { error: result.error ?? "保存に失敗しました" };
    }

    revalidateMemberPaths(memberId);
    revalidatePath("/discover");
    revalidatePath("/messages");
    revalidatePath("/bands");

    return { success: true };
  } catch (error) {
    console.error("[updateFrequencyColorAction]", error);
    return { error: "保存中に問題が発生しました。もう一度お試しください。" };
  }
}

export async function saveMemberEditAction(input: {
  member: Member;
  frequencyColor?: FrequencyColorHex;
}) {
  const user = await getAuthUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  const existing = await getMemberByUserId(user.id, { columns: "list" });
  if (!existing || existing.id !== input.member.id) {
    return { error: "プロフィールが見つかりません" };
  }

  const colorToSave =
    input.frequencyColor && isValidFrequencyColor(input.frequencyColor)
      ? input.frequencyColor
      : undefined;

  const [memberResult, colorResult] = await Promise.all([
    updateMember(input.member),
    colorToSave
      ? saveFrequencyColorForUser(user.id, colorToSave)
      : Promise.resolve({ success: true as const }),
  ]);

  if (!memberResult.success) {
    return { error: memberResult.error ?? "保存に失敗しました" };
  }

  if (!colorResult.success) {
    return { error: colorResult.error ?? "カラーの保存に失敗しました" };
  }

  revalidateMemberPaths(input.member.id);

  void invalidateResonanceCacheForMember(input.member.id);

  return { success: true };
}

export async function updateInstrumentsAction(instruments: string[]) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return { error: "ログインが必要です" };
    }

    const member = await getMemberByUserId(user.id);
    if (!member) {
      return { error: "プロフィールが見つかりません" };
    }

    const allowed = new Set<string>(PLAYING_PART_OPTIONS);
    const sanitized = [...new Set(instruments.filter((item) => allowed.has(item)))];

    const result = await updateMember({
      ...member,
      music: {
        ...member.music,
        instruments: sanitized,
      },
    });

    if (!result.success) {
      return { error: result.error ?? "保存に失敗しました" };
    }

    revalidateMemberPaths(member.id);
    revalidatePath("/bands");

    void invalidateResonanceCacheForMember(member.id);

    return { success: true, instruments: sanitized };
  } catch (error) {
    console.error("[updateInstrumentsAction]", error);
    return { error: "保存中に問題が発生しました。もう一度お試しください。" };
  }
}

export async function updateMemberAction(member: Member) {
  const user = await getAuthUser();

  if (!user) {
    return { error: "ログインが必要です" };
  }

  // 所有者確認と Looking For の差分判定にしか使わないので軽い列だけ引く
  const existing = await getMemberByUserId(user.id, { columns: "list" });
  if (!existing || existing.id !== member.id) {
    return { error: "プロフィールが見つかりません" };
  }

  const result = await updateMember(member);

  if (!result.success) {
    return { error: result.error ?? "保存に失敗しました" };
  }

  revalidateMemberPaths(member.id);

  // 応答をブロックしない後処理
  void invalidateResonanceCacheForMember(member.id);

  return { success: true };
}
