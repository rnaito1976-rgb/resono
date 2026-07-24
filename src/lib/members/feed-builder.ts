import { getMembersPage } from "@/lib/members";
import { resolveCurrentMemberId } from "@/lib/members/resolve";
import { isMemberOwnedByUser } from "@/lib/members/ownership";
import { rankRecommendations } from "@/lib/recommendation/scoring";
import { buildResonanceReason } from "@/lib/resonance/matching";
import {
  getResonanceReasonsFromCache,
  saveResonanceReasonsToCache,
} from "@/lib/resonance/cache";
import { getResonanceStatusBatch } from "@/lib/resonance/status";
import type { Member } from "@/types/member";
import type { MembersFeedPage } from "@/lib/members/feed";

type BuildMembersFeedPageOptions = {
  viewer?: Member;
  userId?: string;
};

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

  const statusMap = await getResonanceStatusBatch(
    viewerMemberId,
    feedMembers.map((member) => member.id)
  );

  const targetIds = feedMembers.map((member) => member.id);
  const cachedReasons = await getResonanceReasonsFromCache(viewerMemberId, targetIds);
  const ranked = rankRecommendations(options.viewer!, feedMembers);
  const toSave: Array<{ targetMemberId: string; reason: ReturnType<typeof buildResonanceReason> }> = [];

  const items = ranked.map(({ member, recommendation }) => {
    let reason = cachedReasons.get(member.id);

    if (!reason) {
      reason = buildResonanceReason(options.viewer!, member);
      toSave.push({ targetMemberId: member.id, reason });
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

  return {
    items,
    nextOffset: page.hasMore ? offset + limit : null,
    hasMore: page.hasMore,
  };
}
