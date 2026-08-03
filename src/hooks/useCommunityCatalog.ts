"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addCommunityCatalogItemAction,
  listCommunityCatalogItemsAction,
} from "@/lib/actions/community-catalog";
import {
  type CommunityCatalogKey,
  isInStaticCatalog,
  mergeCatalogUnique,
  mergeGroupsWithCommunity,
  normalizeCatalogValue,
} from "@/lib/catalog/community-catalog";
import type { WelcomeOptionGroup } from "@/lib/welcome/onboarding-data";

type UseCommunityCatalogOptions = {
  catalogKey: CommunityCatalogKey;
  baseCatalog: readonly string[];
  baseGroups: readonly WelcomeOptionGroup[];
  enabled?: boolean;
};

export function useCommunityCatalog({
  catalogKey,
  baseCatalog,
  baseGroups,
  enabled = true,
}: UseCommunityCatalogOptions) {
  const [communityItems, setCommunityItems] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    void listCommunityCatalogItemsAction(catalogKey).then((items) => {
      if (!cancelled) {
        setCommunityItems(items);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [catalogKey, enabled]);

  const catalog = useMemo(
    () => mergeCatalogUnique(baseCatalog, communityItems),
    [baseCatalog, communityItems]
  );

  const groups = useMemo(
    () => mergeGroupsWithCommunity(baseGroups, communityItems),
    [baseGroups, communityItems]
  );

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
      if (communityItems.some((item) => normalizeCatalogValue(item) === normalized)) {
        return;
      }

      setCommunityItems((current) => [trimmed, ...current]);

      void addCommunityCatalogItemAction({ catalogKey, value: trimmed }).then((result) => {
        if ("error" in result && result.error) {
          console.error("[useCommunityCatalog]", result.error);
          setCommunityItems((current) =>
            current.filter((item) => normalizeCatalogValue(item) !== normalized)
          );
        }
      });
    },
    [baseCatalog, catalogKey, communityItems, enabled]
  );

  return {
    catalog,
    groups,
    recordCustomItem,
  };
}
