import type { RecommendationResult } from "@/lib/recommendation/scoring";
import type { ResonanceReason } from "@/lib/resonance/matching";
import type { ResonanceStatus } from "@/lib/resonance/status";
import type { Member } from "@/types/member";

export type FeedItem = {
  member: Member;
  recommendation?: RecommendationResult;
  reason?: ResonanceReason;
  resonanceStatus?: ResonanceStatus;
};

export type MembersFeedPage = {
  items: FeedItem[];
  hasMore: boolean;
};

export const FEED_PAGE_SIZE = 12;

export function dedupeFeedItems(items: FeedItem[]): FeedItem[] {
  const seen = new Set<string>();
  const deduped: FeedItem[] = [];

  for (const item of items) {
    if (seen.has(item.member.id)) {
      continue;
    }

    seen.add(item.member.id);
    deduped.push(item);
  }

  return deduped;
}

/** First paint: fewer cards = faster TTFB and hydration. */
export const INITIAL_FEED_PAGE_SIZE = 4;
