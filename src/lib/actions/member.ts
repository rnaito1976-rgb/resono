"use server";

import { revalidatePath } from "next/cache";
import { isValidFrequencyColor } from "@/lib/frequency-color/palette";
import { saveFrequencyColorForUser } from "@/lib/frequency-color/server";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { getMemberByUserId, updateMember } from "@/lib/members";
import { PLAYING_PART_OPTIONS } from "@/lib/resonance/dialogue";
import { createClient } from "@/lib/supabase/server";
import type { Member } from "@/types/member";

export async function updateFrequencyColorAction(color: FrequencyColorHex) {
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
    if (!member) {
      return { error: "プロフィールが見つかりません" };
    }

    const result = await saveFrequencyColorForUser(user.id, color);
    if (!result.success) {
      return { error: result.error ?? "保存に失敗しました" };
    }

    revalidatePath("/");
    revalidatePath("/me");
    revalidatePath(`/member/${member.id}`);
    revalidatePath(`/member/${member.id}/edit`);
    revalidatePath("/discover");
    revalidatePath("/messages");
    revalidatePath("/bands");

    return { success: true };
  } catch (error) {
    console.error("[updateFrequencyColorAction]", error);
    return { error: "保存中に問題が発生しました。もう一度お試しください。" };
  }
}

export async function updateInstrumentsAction(instruments: string[]) {
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

    revalidatePath("/");
    revalidatePath("/me");
    revalidatePath(`/member/${member.id}`);
    revalidatePath(`/member/${member.id}/edit`);
    revalidatePath("/bands");

    return { success: true, instruments: sanitized };
  } catch (error) {
    console.error("[updateInstrumentsAction]", error);
    return { error: "保存中に問題が発生しました。もう一度お試しください。" };
  }
}

export async function updateMemberAction(member: Member) {
  const result = await updateMember(member);

  if (!result.success) {
    return { error: result.error ?? "保存に失敗しました" };
  }

  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/me");
  revalidatePath(`/member/${member.id}`);
  revalidatePath(`/member/${member.id}/edit`);

  return { success: true };
}
