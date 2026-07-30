import { HomeFeedList } from "@/components/home/HomeFeedList";
import { buildMembersFeedPage } from "@/lib/members/feed-builder";
import { INITIAL_FEED_PAGE_SIZE } from "@/lib/members/feed";
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

  return (
    <HomeFeedList
      viewerId={member?.id ?? userId}
      showSectionHeader={showSectionHeader}
      initialFeedPage={initialFeedPage}
    />
  );
}
