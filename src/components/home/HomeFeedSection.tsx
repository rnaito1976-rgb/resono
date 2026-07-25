import { buildMembersFeedPage } from "@/lib/members/feed-builder";
import { INITIAL_FEED_PAGE_SIZE } from "@/lib/members/feed";
import { HomeFeedShell } from "@/components/home/HomeFeedShell";
import type { Member } from "@/types/member";

type HomeFeedSectionProps = {
  viewerId?: string;
  currentMember?: Member;
  userId?: string;
};

export async function HomeFeedSection({
  viewerId,
  currentMember,
  userId,
}: HomeFeedSectionProps) {
  const initialFeedPage = await buildMembersFeedPage(0, INITIAL_FEED_PAGE_SIZE, {
    viewer: currentMember,
    userId,
  });

  return (
    <HomeFeedShell
      viewerId={viewerId}
      currentMember={currentMember}
      initialFeedPage={initialFeedPage}
    />
  );
}
