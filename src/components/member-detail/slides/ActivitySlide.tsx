import { MemberActivityFeed } from "@/components/member-detail/MemberActivityFeed";
import { ProfileTabHeading } from "@/components/member-detail/ProfileTabHeading";
import type { MemberActivityFeedItem } from "@/types/activity";

type ActivitySlideProps = {
  activities: MemberActivityFeedItem[];
};

export function ActivitySlide({ activities }: ActivitySlideProps) {
  return (
    <div className="flex h-full flex-col space-y-6 px-6 pb-8 pt-4">
      <ProfileTabHeading
        eyebrow="Activity"
        title="Activity"
        description="あなたの共鳴・Band結成・投稿の履歴です。"
      />
      <MemberActivityFeed activities={activities} />
    </div>
  );
}
