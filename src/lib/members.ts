import { members as fallbackMembers } from "@/data/members";
import { getFrequencyColorsByUserIds } from "@/lib/frequency-color/server";
import { createDefaultMember } from "@/lib/members/defaultMember";
import { createAnonClient } from "@/lib/supabase/anon";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { memberToRow, rowToMember } from "@/lib/supabase/mappers";
import type { Member } from "@/types/member";

async function attachFrequencyColors(members: Member[]): Promise<Member[]> {
  const userIds = members
    .map((member) => member.userId)
    .filter((userId): userId is string => Boolean(userId));

  if (userIds.length === 0) {
    return members;
  }

  const colorMap = await getFrequencyColorsByUserIds(userIds);

  return members.map((member) => ({
    ...member,
    frequencyColor: member.userId
      ? colorMap.get(member.userId)
      : member.frequencyColor,
  }));
}

export async function getMembers(): Promise<Member[]> {
  const page = await getMembersPage(0, 1000);
  return page.members;
}

export async function getMembersPage(
  offset: number,
  limit: number
): Promise<{ members: Member[]; total: number; hasMore: boolean }> {
  if (!isSupabaseConfigured()) {
    const members = fallbackMembers.slice(offset, offset + limit);
    return {
      members,
      total: fallbackMembers.length,
      hasMore: offset + limit < fallbackMembers.length,
    };
  }

  try {
    const supabase = createAnonClient();
    const { data, error, count } = await supabase
      .from("members")
      .select("*", { count: "exact" })
      .order("resonance_rate", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("[Supabase] getMembersPage:", error.message);
      const members = fallbackMembers.slice(offset, offset + limit);
      return {
        members,
        total: fallbackMembers.length,
        hasMore: offset + limit < fallbackMembers.length,
      };
    }

    if (!data?.length) {
      const members = fallbackMembers.slice(offset, offset + limit);
      return {
        members,
        total: fallbackMembers.length,
        hasMore: offset + limit < fallbackMembers.length,
      };
    }

    const members = await attachFrequencyColors(data.map(rowToMember));
    const total = count ?? members.length;

    return {
      members,
      total,
      hasMore: offset + limit < total,
    };
  } catch (error) {
    console.error("[Supabase] getMembersPage:", error);
    const members = fallbackMembers.slice(offset, offset + limit);
    return {
      members,
      total: fallbackMembers.length,
      hasMore: offset + limit < fallbackMembers.length,
    };
  }
}

export async function getMemberById(id: string): Promise<Member | undefined> {
  if (!isSupabaseConfigured()) {
    return fallbackMembers.find((member) => member.id === id);
  }

  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[Supabase] getMemberById:", error.message);
      return fallbackMembers.find((member) => member.id === id);
    }

    if (!data) {
      return fallbackMembers.find((member) => member.id === id);
    }

    const member = rowToMember(data);
    const [withColor] = await attachFrequencyColors([member]);
    return withColor;
  } catch (error) {
    console.error("[Supabase] getMemberById:", error);
    return fallbackMembers.find((member) => member.id === id);
  }
}

export async function updateMember(
  member: Member
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabaseが設定されていません。.env.local を確認してください。",
    };
  }

  try {
    const supabase = await createClient();
    const row = memberToRow(member);
    const { id, ...updates } = row;

    const { error } = await supabase.from("members").update(updates).eq("id", id);

    if (error) {
      console.error("[Supabase] updateMember:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Supabase] updateMember:", error);
    return { success: false, error: "保存に失敗しました" };
  }
}

async function linkMemberToUser(
  memberId: string,
  userId: string
): Promise<Member | undefined> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("members")
      .update({ user_id: userId })
      .eq("id", memberId)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("[Supabase] linkMemberToUser:", error.message);
      return undefined;
    }

    return data ? (await attachFrequencyColors([rowToMember(data)]))[0] : undefined;
  } catch (error) {
    console.error("[Supabase] linkMemberToUser:", error);
    return undefined;
  }
}

export async function getMemberByUserId(
  userId: string
): Promise<Member | undefined> {
  if (!isSupabaseConfigured()) {
    return undefined;
  }

  try {
    const supabase = createAnonClient();
    const { data: byUserId, error: userIdError } = await supabase
      .from("members")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (userIdError) {
      console.error("[Supabase] getMemberByUserId:", userIdError.message);
    }

    if (byUserId) {
      return (await attachFrequencyColors([rowToMember(byUserId)]))[0];
    }

    const { data: byId, error: idError } = await supabase
      .from("members")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (idError) {
      console.error("[Supabase] getMemberByUserId by id:", idError.message);
      return undefined;
    }

    if (!byId) {
      return undefined;
    }

    const member = rowToMember(byId);
    if (!member.userId) {
      const linked = await linkMemberToUser(member.id, userId);
      const resolved = linked ?? { ...member, userId };
      return (await attachFrequencyColors([resolved]))[0];
    }

    return (await attachFrequencyColors([member]))[0];
  } catch (error) {
    console.error("[Supabase] getMemberByUserId:", error);
    return undefined;
  }
}

export async function ensureMemberForUser(
  userId: string,
  email?: string | null
): Promise<Member | null> {
  const existing = await getMemberByUserId(userId);
  if (existing) {
    if (!existing.userId) {
      const linked = await linkMemberToUser(existing.id, userId);
      return linked ?? { ...existing, userId };
    }

    return existing;
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  const member = createDefaultMember(userId, email);

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("members").insert(memberToRow(member));

    if (error?.code === "23505") {
      const duplicate = await getMemberById(userId);
      if (duplicate) {
        if (!duplicate.userId) {
          const linked = await linkMemberToUser(duplicate.id, userId);
          return linked ?? { ...duplicate, userId };
        }

        return duplicate;
      }
    }

    if (error) {
      console.error("[Supabase] ensureMemberForUser:", error.message, error.code);
      return null;
    }

    return member;
  } catch (error) {
    console.error("[Supabase] ensureMemberForUser:", error);
    return null;
  }
}
