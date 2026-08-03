"use server";

import {
  COMMUNITY_CATALOG_KEYS,
  type CommunityCatalogKey,
} from "@/lib/catalog/community-catalog";
import {
  getCommunityCatalogItems,
  upsertCommunityCatalogItem,
} from "@/lib/catalog/queries";
import { getMemberByUserId } from "@/lib/members";
import { createClient } from "@/lib/supabase/server";

const VALID_KEYS = new Set<string>(COMMUNITY_CATALOG_KEYS);

export async function listCommunityCatalogItemsAction(
  catalogKey: CommunityCatalogKey
): Promise<string[]> {
  if (!VALID_KEYS.has(catalogKey)) {
    return [];
  }

  return getCommunityCatalogItems(catalogKey);
}

export async function addCommunityCatalogItemAction(input: {
  catalogKey: CommunityCatalogKey;
  value: string;
}) {
  if (!VALID_KEYS.has(input.catalogKey)) {
    return { error: "無効なカタログです" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const member = user ? await getMemberByUserId(user.id) : null;

  return upsertCommunityCatalogItem({
    catalogKey: input.catalogKey,
    value: input.value,
    createdByMemberId: member?.id ?? null,
  });
}
