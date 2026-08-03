import type { QueryClient } from "@tanstack/react-query";
import { COMMUNITY_CATALOG_KEYS } from "@/lib/catalog/community-catalog";
import { queryKeys } from "@/lib/query/keys";

export function seedCommunityCatalogCache(
  queryClient: QueryClient,
  itemsByKey: Record<string, string[]>
) {
  for (const catalogKey of COMMUNITY_CATALOG_KEYS) {
    queryClient.setQueryData(
      queryKeys.communityCatalog.items(catalogKey),
      itemsByKey[catalogKey] ?? []
    );
  }
}

export function prependCommunityCatalogItem(
  queryClient: QueryClient,
  catalogKey: string,
  value: string
) {
  queryClient.setQueryData<string[]>(
    queryKeys.communityCatalog.items(catalogKey),
    (current = []) => {
      const normalized = value.trim().toLowerCase();
      if (!normalized || current.some((item) => item.trim().toLowerCase() === normalized)) {
        return current;
      }

      return [value.trim(), ...current];
    }
  );
}
