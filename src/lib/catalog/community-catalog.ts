import type { WelcomeOptionGroup } from "@/lib/welcome/onboarding-data";

export const COMMUNITY_CATALOG_KEYS = [
  "artists",
  "genres",
  "parts",
  "songs",
  "live_houses",
  "studios",
  "festivals",
  "gear",
  "wanted_gear",
  "production",
  "style",
] as const;

export type CommunityCatalogKey = (typeof COMMUNITY_CATALOG_KEYS)[number];

export const COMMUNITY_CATALOG_GROUP_LABEL = "みんなの追加";

export function normalizeCatalogValue(value: string): string {
  return value.trim().toLowerCase();
}

export function mergeCatalogUnique(
  baseCatalog: readonly string[],
  communityItems: readonly string[]
): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const item of [...communityItems, ...baseCatalog]) {
    const trimmed = item.trim();
    const key = normalizeCatalogValue(trimmed);
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(trimmed);
  }

  return merged;
}

function flattenGroupItems(groups: readonly WelcomeOptionGroup[]): string[] {
  return groups.flatMap((group) => group.items);
}

export function mergeGroupsWithCommunity(
  baseGroups: readonly WelcomeOptionGroup[],
  communityItems: readonly string[],
  options?: { excludeLabels?: string[]; groupLabel?: string }
): WelcomeOptionGroup[] {
  const excludeLabels = new Set(options?.excludeLabels ?? ["Other", "その他"]);
  const groupLabel = options?.groupLabel ?? COMMUNITY_CATALOG_GROUP_LABEL;

  const staticNormalized = new Set(
    flattenGroupItems(baseGroups)
      .map(normalizeCatalogValue)
      .filter(Boolean)
  );

  const extraItems = communityItems.filter((item) => {
    const normalized = normalizeCatalogValue(item);
    return normalized && !staticNormalized.has(normalized);
  });

  const filteredBase = baseGroups.filter((group) => !excludeLabels.has(group.label));

  if (extraItems.length === 0) {
    return [...filteredBase];
  }

  return [{ label: groupLabel, items: extraItems }, ...filteredBase];
}

export function isInStaticCatalog(
  value: string,
  baseCatalog: readonly string[]
): boolean {
  const normalized = normalizeCatalogValue(value);
  return baseCatalog.some((item) => normalizeCatalogValue(item) === normalized);
}
