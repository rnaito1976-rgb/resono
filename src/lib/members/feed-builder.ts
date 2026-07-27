import { getMembersPage, getMemberById } from "@/lib/members";
import { resolveCurrentMemberId } from "@/lib/members/resolve";
import { isMemberOwnedByUser } from "@/lib/members/ownership";
import { calculateRecommendationScore } from "@/lib/recommendation/scoring";
import {
  buildResonanceReason,
  calculateResonanceMatch,
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
const FEED_FAST_CANDIDATE_LIMIT = 80;
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

function isValidReason(reason: ResonanceReason | undefined): reason is ResonanceReason {
  return reason != null && Number.isFinite(reason.score);
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

async function resolveFeedViewer(viewer?: Member): Promise<Member | undefined> {
  if (!viewer?.id) {
    return undefined;
  }

  if (viewer.portrait.influences.length > 0 || viewer.portrait.location) {
    return viewer;
  }

  return (await getMemberById(viewer.id)) ?? viewer;
}

async function buildResonanceFeedItems(
  viewerInput: Member,
  viewerMemberId: string,
  feedMembers: Member[],
  options: { syncLimit?: number; includeStatus?: boolean } = {}
): Promise<FeedItem[]> {
  const syncLimit = options.syncLimit ?? SYNC_REASON_BUILD_LIMIT;
  const includeStatus = options.includeStatus ?? true;
  const viewer = (await resolveFeedViewer(viewerInput)) ?? viewerInput;
  const targetIds = feedMembers.map((member) => member.id);
  const [statusMap, cachedReasons] = await Promise.all([
    includeStatus
      ? getResonanceStatusBatch(viewerMemberId, targetIds)
      : Promise.resolve({} as Awaited<ReturnType<typeof getResonanceStatusBatch>>),
    getResonanceReasonsFromCache(viewerMemberId, targetIds),
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

  const { members: allMembers } = await getMembersPage(0, candidateLimit);
  const candidates = filterFeedMembers(allMembers, viewerMemberId, userId);
  const feedViewer = (await resolveFeedViewer(viewer)) ?? viewer;
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
  const feedViewer = (await resolveFeedViewer(options.viewer)) ?? options.viewer;

  // Scroll pages: skip heavy status/reason sync — client fills status, cache fills reasons.
  const items = await buildResonanceFeedItems(
    feedViewer,
    viewerMemberId,
    rankedPageMembers,
    {
      syncLimit: isScrollPage ? 0 : SYNC_REASON_BUILD_LIMIT,
      includeStatus: !isScrollPage,
    }
  );

  if (options.fast || isScrollPage) {
    return buildFeedPageResult(items, offset, limit, sorted.length);
  }

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
