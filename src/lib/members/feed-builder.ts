import { getMembersPage, getMemberById } from "@/lib/members";
import { resolveCurrentMemberId } from "@/lib/members/resolve";
import { isMemberOwnedByUser } from "@/lib/members/ownership";
import { rankRecommendations } from "@/lib/recommendation/scoring";
import { buildResonanceReason } from "@/lib/resonance/matching";
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

type BuildMembersFeedPageOptions = {
  viewer?: Member;
  userId?: string;
  /** Skip recommendation ranking for faster first paint. */
  fast?: boolean;
};

function isValidReason(reason: ResonanceReason | undefined): reason is ResonanceReason {
  return reason != null && Number.isFinite(reason.score);
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
  const page = await getMembersPage(offset, limit);
  const viewerMemberId = options.viewer?.id ?? (await resolveCurrentMemberId());
  const feedMembers = page.members.filter((member) => {
    if (viewerMemberId && member.id === viewerMemberId) {
      return false;
    }

    if (options.userId && isMemberOwnedByUser(member, options.userId)) {
      return false;
    }

    return true;
  });

  if (!options.viewer || !viewerMemberId) {
    return {
      items: feedMembers.map((member) => ({
        member,
        recommendation: undefined,
        reason: undefined,
        resonanceStatus: undefined,
      })),
      nextOffset: page.hasMore ? offset + limit : null,
      hasMore: page.hasMore,
    };
  }

  const feedViewer = (await resolveFeedViewer(options.viewer)) ?? options.viewer;

  if (options.fast) {
    const items = await buildResonanceFeedItems(
      feedViewer,
      viewerMemberId,
      feedMembers
    );

    return {
      items,
      nextOffset: page.hasMore ? offset + limit : null,
      hasMore: page.hasMore,
    };
  }

  const targetIds = feedMembers.map((member) => member.id);
  const [statusMap, cachedReasons] = await Promise.all([
    getResonanceStatusBatch(viewerMemberId, targetIds),
    getResonanceReasonsFromCache(viewerMemberId, targetIds),
  ]);

  const ranked = rankRecommendations(feedViewer, feedMembers);
  const toSave: Array<{ targetMemberId: string; reason: ReturnType<typeof buildResonanceReason> }> = [];
  const deferredMembers: Member[] = [];

  const items = ranked.map(({ member, recommendation }, index) => {
    let reason = cachedReasons.get(member.id);

    if (!isValidReason(reason)) {
      if (index < SYNC_REASON_BUILD_LIMIT) {
        reason = buildResonanceReason(feedViewer, member);
        toSave.push({ targetMemberId: member.id, reason });
      } else {
        deferredMembers.push(member);
      }
    }

    return {
      member,
      recommendation,
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
        reason: buildResonanceReason(feedViewer, member),
      }));
      await saveResonanceReasonsToCache(viewerMemberId, entries);
    })();
  }

  return {
    items,
    nextOffset: page.hasMore ? offset + limit : null,
    hasMore: page.hasMore,
  };
}
