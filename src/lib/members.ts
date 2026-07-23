import { members as fallbackMembers } from "@/data/members";
import { createDefaultMember } from "@/lib/members/defaultMember";
import { createAnonClient } from "@/lib/supabase/anon";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { memberToRow, rowToMember } from "@/lib/supabase/mappers";
import type { Member } from "@/types/member";

export async function getMembers(): Promise<Member[]> {
  if (!isSupabaseConfigured()) {
    return fallbackMembers;
  }

  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("resonance_rate", { ascending: false });

    if (error) {
      console.error("[Supabase] getMembers:", error.message);
      return fallbackMembers;
    }

    if (!data?.length) {
      return fallbackMembers;
    }

    return data.map(rowToMember);
  } catch (error) {
    console.error("[Supabase] getMembers:", error);
    return fallbackMembers;
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

    return rowToMember(data);
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

    return data ? rowToMember(data) : undefined;
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
      return rowToMember(byUserId);
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
      return linked ?? { ...member, userId };
    }

    return member;
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
