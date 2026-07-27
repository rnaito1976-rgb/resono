import { cache } from "react";
import { getMembersPage, getMemberById } from "@/lib/members";
import { resolveCurrentMemberId } from "@/lib/members/resolve";
import { isMemberOwnedByUser } from "@/lib/members/ownership";
import { calculateRecommendationScore } from "@/lib/recommendation/scoring";
import {
  buildResonanceReason,
  calculateResonanceMatch,
  isCurrentResonanceReason,
} from "@/lib/resonance/matching";
import type { ResonanceReason } from "@/lib/resonance/matching";
import {
  getResonanceReasonsFromCache,
  saveResonanceReasonsToCache,
} from "@/lib/resonance/cache";
import { getResonanceStatusBatch } from "@/lib/resonance/status";
import type { Member } from "@/types/member";
import type { FeedItem, MembersFeedPage } from "@/lib/members/feed";

/** Build reasons synchronously for the first N cards; defer the rest. */
const SYNC_REASON_BUILD_LIMIT = 6;
const FEED_CANDIDATE_LIMIT = 200;
const FEED_FAST_CANDIDATE_LIMIT = 24;
const RANK_CACHE_TTL_MS = 45_000;

type BuildMembersFeedPageOptions = {
  viewer?: Member;
  userId?: string;
  /** Skip recommendation scoring for faster first paint. */
  fast?: boolean;
};

type RankedFeedCacheEntry = {
  expiresAt: number;
  members: Member[];
};

const rankedFeedCache = new Map<string, RankedFeedCacheEntry>();

type CandidatePoolEntry = {
  expiresAt: number;
  promise: Promise<{ members: Member[] }>;
};

const CANDIDATE_POOL_TTL_MS = 20_000;
const candidatePoolCache = new Map<number, CandidatePoolEntry>();

/** 候補プールは全閲覧者で共通なので、短時間だけ使い回して重い一覧クエリを減らす */
function getCandidatePool(candidateLimit: number): Promise<{ members: Member[] }> {
  const cached = candidatePoolCache.get(candidateLimit);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.promise;
  }

  const promise = getMembersPage(0, candidateLimit).catch((error) => {
    candidatePoolCache.delete(candidateLimit);
    throw error;
  });

  candidatePoolCache.set(candidateLimit, {
    promise,
    expiresAt: Date.now() + CANDIDATE_POOL_TTL_MS,
  });

  return promise;
}

export function clearRankedFeedCache(memberId?: string) {
  candidatePoolCache.clear();

  if (!memberId) {
    rankedFeedCache.clear();
    return;
  }

  for (const key of rankedFeedCache.keys()) {
    if (key.startsWith(`${memberId}:`)) {
      rankedFeedCache.delete(key);
    }
  }
}

function isValidReason(reason: ResonanceReason | undefined): reason is ResonanceReason {
  return isCurrentResonanceReason(reason);
}

/** Seed / demo profiles without a linked auth user. */
function isSeedFeedMember(member: Member): boolean {
  return !member.userId;
}

function filterFeedMembers(
  members: Member[],
  viewerMemberId?: string | null,
  userId?: string
): Member[] {
  return members.filter((member) => {
    if (viewerMemberId && member.id === viewerMemberId) {
      return false;
    }

    if (userId && isMemberOwnedByUser(member, userId)) {
      return false;
    }

    return true;
  });
}

function sortMembersForFeed(
  members: Member[],
  getScore: (member: Member) => number
): Member[] {
  return [...members].sort((a, b) => {
    const aSeed = isSeedFeedMember(a);
    const bSeed = isSeedFeedMember(b);

    if (aSeed !== bSeed) {
      return aSeed ? 1 : -1;
    }

    return getScore(b) - getScore(a);
  });
}

function buildFeedPageResult(
  items: FeedItem[],
  offset: number,
  limit: number,
  totalCount: number
): MembersFeedPage {
  const nextOffset = offset + limit < totalCount ? offset + limit : null;

  return {
    items,
    nextOffset,
    hasMore: nextOffset != null,
  };
}

/** 一覧列の viewer から詳細を 1 回だけ引く（getMemberById も request 内で dedupe） */
const resolveFeedViewer = cache(async (viewer: Member): Promise<Member> => {
  const detail = await getMemberById(viewer.id);
  return detail ?? viewer;
});

async function buildResonanceFeedItems(
  viewerInput: Member,
  viewerMemberId: string,
  feedMembers: Member[],
  options: { syncLimit?: number; includeStatus?: boolean; cachedReasons?: Map<string, ResonanceReason> } = {}
): Promise<FeedItem[]> {
  const syncLimit = options.syncLimit ?? SYNC_REASON_BUILD_LIMIT;
  const includeStatus = options.includeStatus ?? true;
  const viewer = await resolveFeedViewer(viewerInput);
  const targetIds = feedMembers.map((member) => member.id);
  const [statusMap, cachedReasons] = await Promise.all([
    includeStatus
      ? getResonanceStatusBatch(viewerMemberId, targetIds)
      : Promise.resolve({} as Awaited<ReturnType<typeof getResonanceStatusBatch>>),
    options.cachedReasons
      ? Promise.resolve(options.cachedReasons)
      : getResonanceReasonsFromCache(viewerMemberId, targetIds),
  ]);

  const toSave: Array<{
    targetMemberId: string;
    reason: ReturnType<typeof buildResonanceReason>;
  }> = [];
  const deferredMembers: Member[] = [];

  const items = feedMembers.map((member, index) => {
    let reason = cachedReasons.get(member.id);

    if (!isValidReason(reason)) {
      if (index < syncLimit) {
        reason = buildResonanceReason(viewer, member);
        toSave.push({ targetMemberId: member.id, reason });
      } else {
        deferredMembers.push(member);
      }
    }

    return {
      member,
      recommendation: undefined,
      reason,
      resonanceStatus: includeStatus ? statusMap[member.id] : undefined,
    };
  });

  if (toSave.length > 0) {
    void saveResonanceReasonsToCache(viewerMemberId, toSave);
  }

  if (deferredMembers.length > 0) {
    void (async () => {
      const entries = deferredMembers.map((member) => ({
        targetMemberId: member.id,
        reason: buildResonanceReason(viewer, member),
      }));
      await saveResonanceReasonsToCache(viewerMemberId, entries);
    })();
  }

  return items;
}

async function getRankedFeedMembers(
  viewer: Member,
  viewerMemberId: string,
  userId: string | undefined,
  candidateLimit: number
): Promise<Member[]> {
  const cacheKey = `${viewerMemberId}:${candidateLimit}`;
  const cached = rankedFeedCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.members;
  }

  // 候補プールは閲覧者に依存しないので、取得とビューアー解決を同時に走らせる
  const [{ members: allMembers }, resolvedViewer] = await Promise.all([
    getCandidatePool(candidateLimit),
    resolveFeedViewer(viewer),
  ]);
  const candidates = filterFeedMembers(allMembers, viewerMemberId, userId);
  const feedViewer = resolvedViewer ?? viewer;
  const cachedReasons = await getResonanceReasonsFromCache(
    viewerMemberId,
    candidates.map((member) => member.id)
  );
  const sorted = sortMembersForFeed(candidates, (member) => {
    const reason = cachedReasons.get(member.id);
    if (isValidReason(reason)) {
      return reason.score;
    }

    return calculateResonanceMatch(feedViewer, member);
  });

  rankedFeedCache.set(cacheKey, {
    members: sorted,
    expiresAt: Date.now() + RANK_CACHE_TTL_MS,
  });

  return sorted;
}

export async function buildMembersFeedPage(
  offset: number,
  limit: number,
  options: BuildMembersFeedPageOptions = {}
): Promise<MembersFeedPage> {
  const candidateLimit = options.fast ? FEED_FAST_CANDIDATE_LIMIT : FEED_CANDIDATE_LIMIT;
  const viewerMemberId = options.viewer?.id ?? (await resolveCurrentMemberId());
  const isScrollPage = offset > 0;

  if (!options.viewer || !viewerMemberId) {
    const { members: allMembers } = await getMembersPage(0, candidateLimit);
    const candidates = filterFeedMembers(allMembers, viewerMemberId, options.userId);
    const sorted = sortMembersForFeed(candidates, (member) => member.resonanceRate);

    return buildFeedPageResult(
      sorted.slice(offset, offset + limit).map((member) => ({
        member,
        recommendation: undefined,
        reason: undefined,
        resonanceStatus: undefined,
      })),
      offset,
      limit,
      sorted.length
    );
  }

  const sorted = await getRankedFeedMembers(
    options.viewer,
    viewerMemberId,
    options.userId,
    candidateLimit
  );
  const rankedPageMembers = sorted.slice(offset, offset + limit);

  // 初回もステータスはクライアント側で後追い — SSR を resonance クエリで止めない
  const items = await buildResonanceFeedItems(
    options.viewer,
    viewerMemberId,
    rankedPageMembers,
    {
      syncLimit: isScrollPage ? 0 : SYNC_REASON_BUILD_LIMIT,
      includeStatus: false,
    }
  );

  if (options.fast || isScrollPage) {
    return buildFeedPageResult(items, offset, limit, sorted.length);
  }

  const feedViewer = await resolveFeedViewer(options.viewer);

  return buildFeedPageResult(
    items.map((item) => ({
      ...item,
      recommendation: calculateRecommendationScore(feedViewer, item.member),
    })),
    offset,
    limit,
    sorted.length
  );
}
