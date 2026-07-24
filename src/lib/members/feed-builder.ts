import { getMembersPage } from "@/lib/members";
import { resolveCurrentMemberId } from "@/lib/members/resolve";
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
  const viewerMemberId = options.viewer
    ? (await resolveCurrentMemberId()) ?? options.viewer.id
    : null;
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

  return {
    items: rankRecommendations(options.viewer!, feedMembers).map(
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
