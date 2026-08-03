import { HomeFeedList } from "@/components/home/HomeFeedList";
import { buildMembersFeedPage } from "@/lib/members/feed-builder";
import { INITIAL_FEED_PAGE_SIZE } from "@/lib/members/feed";
import { getAppliedPartsBatchForViewer } from "@/lib/recruitment/applications";
import { collectRecruitmentTargetIds } from "@/lib/recruitment/cache";
import type { Member } from "@/types/member";

type HomeFeedSectionProps = {
  member?: Member;
  userId?: string;
  showSectionHeader?: boolean;
};

export async function HomeFeedSection({
  member,
  userId,
  showSectionHeader = false,
}: HomeFeedSectionProps) {
  const initialFeedPage =
    member || userId
      ? await buildMembersFeedPage({
          limit: INITIAL_FEED_PAGE_SIZE,
          viewer: member,
          userId,
          fast: true,
        })
      : undefined;

  const recruitmentTargetIds = initialFeedPage
    ? collectRecruitmentTargetIds(
        initialFeedPage.items.map((item) => item.member),
        member?.id
      )
    : [];

  const appliedBatch =
    member?.id && recruitmentTargetIds.length > 0
      ? await getAppliedPartsBatchForViewer(member.id, recruitmentTargetIds)
      : {};

  const initialAppliedByTarget = Object.fromEntries(
    recruitmentTargetIds.map((id) => [id, appliedBatch[id] ?? []])
  );

  return (
    <HomeFeedList
      viewerId={member?.id ?? userId}
      viewerMemberId={member?.id}
      showSectionHeader={showSectionHeader}
      initialFeedPage={initialFeedPage}
      initialAppliedByTarget={initialAppliedByTarget}
    />
  );
}
