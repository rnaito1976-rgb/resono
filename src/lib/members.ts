import { members as fallbackMembers } from "@/data/members";
import { createClient } from "@/lib/supabase/server";
import { memberToRow, rowToMember } from "@/lib/supabase/mappers";
import type { Member } from "@/types/member";

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getMembers(): Promise<Member[]> {
  if (!isSupabaseConfigured()) {
    return fallbackMembers;
  }

  try {
    const supabase = createClient();
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
    const supabase = createClient();
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
    const supabase = createClient();
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
