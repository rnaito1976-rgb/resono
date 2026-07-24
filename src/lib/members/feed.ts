import type { RecommendationResult } from "@/lib/recommendation/scoring";
import type { ResonanceReason } from "@/lib/resonance/matching";
import type { Member } from "@/types/member";

export type FeedItem = {
  member: Member;
  recommendation?: RecommendationResult;
  reason?: ResonanceReason;
};

export type MembersFeedPage = {
  items: FeedItem[];
  nextOffset: number | null;
  hasMore: boolean;
};

export const FEED_PAGE_SIZE = 20;
