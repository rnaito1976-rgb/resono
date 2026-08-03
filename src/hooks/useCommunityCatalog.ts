"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addCommunityCatalogItemAction,
  listCommunityCatalogItemsAction,
} from "@/lib/actions/community-catalog";
import { prependCommunityCatalogItem } from "@/lib/catalog/cache";
import {
  type CommunityCatalogKey,
  isInStaticCatalog,
  mergeCatalogUnique,
  mergeGroupsWithCommunity,
  normalizeCatalogValue,
} from "@/lib/catalog/community-catalog";
import { queryKeys } from "@/lib/query/keys";
import type { WelcomeOptionGroup } from "@/lib/welcome/onboarding-data";

type UseCommunityCatalogOptions = {
  catalogKey: CommunityCatalogKey;
  baseCatalog: readonly string[];
  baseGroups: readonly WelcomeOptionGroup[];
  enabled?: boolean;
};

const COMMUNITY_CATALOG_STALE_MS = 5 * 60 * 1000;

export function useCommunityCatalog({
  catalogKey,
  baseCatalog,
  baseGroups,
  enabled = true,
}: UseCommunityCatalogOptions) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.communityCatalog.items(catalogKey);

  const query = useQuery({
    queryKey,
    queryFn: () => listCommunityCatalogItemsAction(catalogKey),
    enabled,
    staleTime: COMMUNITY_CATALOG_STALE_MS,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const communityItems = query.data ?? [];

  const catalog = mergeCatalogUnique(baseCatalog, communityItems);
  const groups = mergeGroupsWithCommunity(baseGroups, communityItems);

  const recordCustomItem = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || !enabled) {
        return;
      }

      if (isInStaticCatalog(trimmed, baseCatalog)) {
        return;
      }

      const normalized = normalizeCatalogValue(trimmed);
      const current = queryClient.getQueryData<string[]>(queryKey) ?? [];
      if (current.some((item) => normalizeCatalogValue(item) === normalized)) {
        return;
      }

      prependCommunityCatalogItem(queryClient, catalogKey, trimmed);

      void addCommunityCatalogItemAction({ catalogKey, value: trimmed }).then((result) => {
        if ("error" in result && result.error) {
          console.error("[useCommunityCatalog]", result.error);
          queryClient.setQueryData<string[]>(queryKey, current);
        }
      });
    },
    [baseCatalog, catalogKey, enabled, queryClient, queryKey]
  );

  return {
    catalog,
    groups,
    recordCustomItem,
  };
}
