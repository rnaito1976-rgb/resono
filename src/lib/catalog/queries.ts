import { createAnonClient } from "@/lib/supabase/anon";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { CommunityCatalogKey } from "@/lib/catalog/community-catalog";
import { normalizeCatalogValue } from "@/lib/catalog/community-catalog";

export async function getCommunityCatalogItems(
  catalogKey: CommunityCatalogKey
): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("community_catalog_items")
    .select("value")
    .eq("catalog_key", catalogKey)
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    console.error("[CommunityCatalog] getCommunityCatalogItems:", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.value).filter(Boolean);
}

export async function upsertCommunityCatalogItem(input: {
  catalogKey: CommunityCatalogKey;
  value: string;
  createdByMemberId?: string | null;
}): Promise<{ success: true } | { error: string }> {
  const trimmed = input.value.trim();
  const valueNormalized = normalizeCatalogValue(trimmed);

  if (!trimmed || !valueNormalized) {
    return { error: "項目を入力してください" };
  }

  if (trimmed.length > 120) {
    return { error: "120文字以内で入力してください" };
  }

  if (!isSupabaseConfigured()) {
    return { error: "保存できませんでした" };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { error: "保存できませんでした" };
  }

  const { error } = await admin.from("community_catalog_items").upsert(
    {
      catalog_key: input.catalogKey,
      value: trimmed,
      value_normalized: valueNormalized,
      created_by_member_id: input.createdByMemberId ?? null,
    },
    { onConflict: "catalog_key,value_normalized", ignoreDuplicates: true }
  );

  if (error) {
    console.error("[CommunityCatalog] upsertCommunityCatalogItem:", error.message);
    return { error: "保存に失敗しました" };
  }

  return { success: true };
}
