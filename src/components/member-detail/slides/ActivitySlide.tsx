import { MemberActivityFeed } from "@/components/member-detail/MemberActivityFeed";
import type { MemberActivityFeedItem } from "@/types/activity";
import { SectionBlock } from "@/components/ui";

type ActivitySlideProps = {
  activities: MemberActivityFeedItem[];
};

export function ActivitySlide({ activities }: ActivitySlideProps) {
  return (
    <div className="flex h-full flex-col space-y-6 px-6 pb-8 pt-4">
      <SectionBlock label="Activity">
        <p className="mb-5 text-[15px] leading-relaxed text-white/50">
          共鳴・Band結成・投稿の履歴が時系列で残ります。
        </p>
        <MemberActivityFeed activities={activities} />
      </SectionBlock>
    </div>
  );
}
