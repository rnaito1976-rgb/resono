"use server";

import {
  getAppliedPartsBatchForViewer,
  getAppliedPartsForViewer,
  getRecruitmentApplicantsByPart,
} from "@/lib/recruitment/applications";
import { normalizeRecruitmentPart } from "@/lib/recruitment/part";
import { resolveCurrentMemberId } from "@/lib/members/resolve";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function getMyRecruitmentApplicationsAction(targetMemberId: string) {
  const memberId = await resolveCurrentMemberId();
  if (!memberId) {
    return { appliedParts: [] as string[] };
  }

  const appliedParts = await getAppliedPartsForViewer(memberId, targetMemberId);
  return { appliedParts };
}

export async function getMyRecruitmentApplicationsBatchAction(
  targetMemberIds: string[]
) {
  const memberId = await resolveCurrentMemberId();
  if (!memberId) {
    return { appliedByTarget: {} as Record<string, string[]> };
  }

  const appliedByTarget = await getAppliedPartsBatchForViewer(
    memberId,
    targetMemberIds
  );
  return { appliedByTarget };
}

export async function getRecruitmentApplicantsAction(targetMemberId: string) {
  const memberId = await resolveCurrentMemberId();
  if (!memberId || memberId !== targetMemberId) {
    return { error: "閲覧できません" };
  }

  const parts = await getRecruitmentApplicantsByPart(targetMemberId);
  return { parts };
}

export async function toggleRecruitmentApplicationAction(input: {
  targetMemberId: string;
  part: string;
}) {
  if (!isSupabaseConfigured()) {
    return { error: "保存できませんでした" };
  }

  const trimmed = input.part.trim();
  if (!trimmed) {
    return { error: "パートを指定してください" };
  }

  const memberId = await resolveCurrentMemberId();
  if (!memberId) {
    return { error: "ログインが必要です", requiresLogin: true as const };
  }

  if (memberId === input.targetMemberId) {
    return { error: "自分の募集には応募できません" };
  }

  const supabase = await createClient();
  const partNormalized = normalizeRecruitmentPart(trimmed);

  const { data: existing, error: readError } = await supabase
    .from("band_recruitment_applications")
    .select("id")
    .eq("target_member_id", input.targetMemberId)
    .eq("applicant_member_id", memberId)
    .eq("part_normalized", partNormalized)
    .maybeSingle();

  if (readError) {
    console.error("[Recruitment] toggle read:", readError.message);
    return { error: "保存に失敗しました" };
  }

  if (existing) {
    const { error: deleteError } = await supabase
      .from("band_recruitment_applications")
      .delete()
      .eq("id", existing.id);

    if (deleteError) {
      console.error("[Recruitment] toggle delete:", deleteError.message);
      return { error: "保存に失敗しました" };
    }

    return { applied: false, part: trimmed };
  }

  const { error: insertError } = await supabase
    .from("band_recruitment_applications")
    .insert({
      target_member_id: input.targetMemberId,
      applicant_member_id: memberId,
      part: trimmed,
      part_normalized: partNormalized,
    });

  if (insertError) {
    console.error("[Recruitment] toggle insert:", insertError.message);
    return { error: "保存に失敗しました" };
  }

  return { applied: true, part: trimmed };
}
