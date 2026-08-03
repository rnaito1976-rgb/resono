import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getMembersByIds } from "@/lib/members";

export { normalizeRecruitmentPart } from "@/lib/recruitment/part";

export type RecruitmentApplicant = {
  id: string;
  name: string;
};

export type RecruitmentPartApplicants = {
  part: string;
  applicants: RecruitmentApplicant[];
};

export async function getAppliedPartsForViewer(
  applicantMemberId: string,
  targetMemberId: string
): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("band_recruitment_applications")
    .select("part")
    .eq("applicant_member_id", applicantMemberId)
    .eq("target_member_id", targetMemberId);

  if (error) {
    console.error("[Recruitment] getAppliedPartsForViewer:", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.part).filter(Boolean);
}

export async function getAppliedPartsBatchForViewer(
  applicantMemberId: string,
  targetMemberIds: string[]
): Promise<Record<string, string[]>> {
  if (!isSupabaseConfigured() || targetMemberIds.length === 0) {
    return {};
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("band_recruitment_applications")
    .select("target_member_id, part")
    .eq("applicant_member_id", applicantMemberId)
    .in("target_member_id", targetMemberIds);

  if (error) {
    console.error("[Recruitment] getAppliedPartsBatchForViewer:", error.message);
    return {};
  }

  const result: Record<string, string[]> = {};

  for (const row of data ?? []) {
    const targetId = row.target_member_id;
    if (!targetId || !row.part) {
      continue;
    }

    if (!result[targetId]) {
      result[targetId] = [];
    }

    result[targetId].push(row.part);
  }

  return result;
}

export async function getRecruitmentApplicantsByPart(
  targetMemberId: string
): Promise<RecruitmentPartApplicants[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("band_recruitment_applications")
    .select("part, applicant_member_id")
    .eq("target_member_id", targetMemberId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Recruitment] getRecruitmentApplicantsByPart:", error.message);
    return [];
  }

  const applicantIds = [
    ...new Set((data ?? []).map((row) => row.applicant_member_id).filter(Boolean)),
  ];
  const memberMap = await getMembersByIds(applicantIds);

  const grouped = new Map<string, RecruitmentApplicant[]>();

  for (const row of data ?? []) {
    const part = row.part;
    const applicantId = row.applicant_member_id;
    if (!part || !applicantId) {
      continue;
    }

    const member = memberMap.get(applicantId);
    if (!member) {
      continue;
    }

    const list = grouped.get(part) ?? [];
    if (!list.some((entry) => entry.id === member.id)) {
      list.push({ id: member.id, name: member.name });
    }
    grouped.set(part, list);
  }

  return [...grouped.entries()].map(([part, applicants]) => ({
    part,
    applicants,
  }));
}
