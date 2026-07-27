"use server";

import { revalidatePath } from "next/cache";
import { getMemberById, getMemberByUserId, updateMember } from "@/lib/members";
import { applyProfileAiComment } from "@/lib/profile/ai-comment";
import {
  appendProfileGrowActivity,
  applyProfileGrowCandidates,
  buildProfileGrowActivityMilestone,
} from "@/lib/profile/grow/merge";
import { compareProfileGrowResonance } from "@/lib/profile/grow/resonance";
import { syncMemberFromProfileItems, syncProfileItemsFromMemberFields } from "@/lib/profile/items";
import { invalidateResonanceCacheForMember } from "@/lib/resonance/cache";
import { getAuthUser } from "@/lib/supabase/auth";
import type { ProfileGrowCandidate, ProfileGrowResonanceInsight } from "@/types/profile-grow";
import type { Member } from "@/types/member";

export async function getProfileGrowMemberAction(
  memberId: string
): Promise<Member | null> {
  return (await getMemberById(memberId)) ?? null;
}

export async function getProfileGrowResonanceInsightAction(
  before: Member,
  after: Member
): Promise<ProfileGrowResonanceInsight | null> {
  const user = await getAuthUser();

  if (!user) {
    return null;
  }

  const existing = await getMemberByUserId(user.id, { columns: "list" });
  if (!existing || existing.id !== before.id || existing.id !== after.id) {
    return null;
  }

  return compareProfileGrowResonance(before, after);
}

export async function saveProfileGrowSessionAction(candidates: ProfileGrowCandidate[]) {
  const user = await getAuthUser();

  if (!user) {
    return { error: "ログインが必要です。" };
  }

  const member = await getMemberByUserId(user.id);
  if (!member) {
    return { error: "プロフィールが見つかりません。" };
  }

  if (!candidates.length) {
    return { error: "保存する更新候補がありません。" };
  }

  const before = member;
  const { member: merged, updatedFields } = applyProfileGrowCandidates(member, candidates);
  const milestone = buildProfileGrowActivityMilestone(updatedFields);
  const withActivity = appendProfileGrowActivity(merged, milestone);
  const synced = syncMemberFromProfileItems(syncProfileItemsFromMemberFields(withActivity));
  const updated = applyProfileAiComment(synced);

  const result = await updateMember(updated);

  if (!result.success) {
    return { error: result.error ?? "保存に失敗しました。" };
  }

  void invalidateResonanceCacheForMember(member.id);
  void publishLookingForUpdateIfChanged(before, updated);

  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath("/me");
  revalidatePath(`/member/${member.id}`);

  return {
    success: true,
    updatedFields,
    after: updated,
  };
}

async function publishLookingForUpdateIfChanged(before: Member, updated: Member) {
  try {
    const { hasLookingForChanged } = await import("@/lib/live/looking-for");
    if (!hasLookingForChanged(before, updated)) {
      return;
    }

    const { publishLiveEvent } = await import("@/lib/live/events");
    await publishLiveEvent({
      kind: "looking_for_updated",
      title: updated.name,
      subtitle: "Looking For を更新しました",
      href: `/member/${updated.id}`,
      photo: updated.photo,
      actorMemberId: updated.id,
    });
  } catch (error) {
    console.error("[saveProfileGrowSessionAction] live event", error);
  }
}
