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

type BuildMembersFeedPageOptions = {
  viewer?: Member;
  userId?: string;
  /** Skip recommendation scoring for faster first paint. */
  fast?: boolean;
};

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
  syncLimit = SYNC_REASON_BUILD_LIMIT
): Promise<FeedItem[]> {
  const viewer = (await resolveFeedViewer(viewerInput)) ?? viewerInput;
  const targetIds = feedMembers.map((member) => member.id);
  const [statusMap, cachedReasons] = await Promise.all([
    getResonanceStatusBatch(viewerMemberId, targetIds),
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
      resonanceStatus: statusMap[member.id],
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

export async function buildMembersFeedPage(
  offset: number,
  limit: number,
  options: BuildMembersFeedPageOptions = {}
): Promise<MembersFeedPage> {
  const candidateLimit = options.fast ? FEED_FAST_CANDIDATE_LIMIT : FEED_CANDIDATE_LIMIT;
  const { members: allMembers } = await getMembersPage(0, candidateLimit);
  const viewerMemberId = options.viewer?.id ?? (await resolveCurrentMemberId());
  const candidates = filterFeedMembers(allMembers, viewerMemberId, options.userId);

  if (!options.viewer || !viewerMemberId) {
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

  const feedViewer = (await resolveFeedViewer(options.viewer)) ?? options.viewer;
  const cachedReasons = await getResonanceReasonsFromCache(
    viewerMemberId,
    candidates.map((member) => member.id)
  );
  const sorted = sortMembersForFeed(candidates, (member) => {
    const cached = cachedReasons.get(member.id);
    if (isValidReason(cached)) {
      return cached.score;
    }

    return calculateResonanceMatch(feedViewer, member);
  });
  const rankedPageMembers = sorted.slice(offset, offset + limit);

  if (options.fast) {
    const items = await buildResonanceFeedItems(
      feedViewer,
      viewerMemberId,
      rankedPageMembers
    );

    return buildFeedPageResult(items, offset, limit, sorted.length);
  }

  const items = await buildResonanceFeedItems(
    feedViewer,
    viewerMemberId,
    rankedPageMembers
  );

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
