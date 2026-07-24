import { getMembersPage } from "@/lib/members";
import { isMemberOwnedByUser } from "@/lib/members/ownership";
import { rankRecommendations } from "@/lib/recommendation/scoring";
import { buildResonanceReason } from "@/lib/resonance/matching";
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
  const feedMembers = page.members.filter((member) => {
    if (options.viewer && member.id === options.viewer.id) {
      return false;
    }

    if (options.userId && isMemberOwnedByUser(member, options.userId)) {
      return false;
    }

    return true;
  });

  if (!options.viewer) {
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
    options.viewer.id,
    feedMembers.map((member) => member.id)
  );

  return {
    items: rankRecommendations(options.viewer, feedMembers).map(
      ({ member, recommendation }) => ({
        member,
        recommendation,
        reason: buildResonanceReason(options.viewer!, member),
        resonanceStatus: statusMap[member.id],
      })
    ),
    nextOffset: page.hasMore ? offset + limit : null,
    hasMore: page.hasMore,
  };
}
