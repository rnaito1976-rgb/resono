"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateMember } from "@/lib/members";
import type { Member } from "@/types/member";

export async function updateMemberAction(member: Member) {
  const result = await updateMember(member);

  if (!result.success) {
    return { error: result.error ?? "保存に失敗しました" };
  }

  revalidatePath("/");
  revalidatePath("/me");
  revalidatePath(`/member/${member.id}`);
  redirect(`/member/${member.id}`);
}
