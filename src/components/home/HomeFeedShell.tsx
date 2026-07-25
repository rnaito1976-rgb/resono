import { PersonCard } from "@/components/person-card/PersonCard";
import { HomeFeedInfinite } from "@/components/home/HomeFeedInfinite";
import { INITIAL_FEED_PAGE_SIZE, type MembersFeedPage } from "@/lib/members/feed";
import type { Member } from "@/types/member";

type HomeFeedShellProps = {
  viewerId?: string;
  currentMember?: Member;
  initialFeedPage: MembersFeedPage;
};

export function HomeFeedShell({
  viewerId,
  currentMember,
  initialFeedPage,
}: HomeFeedShellProps) {
  const feedItems = initialFeedPage.items;
  const showSectionHeader = Boolean(currentMember && feedItems.length > 0);

  return (
    <div className="flex flex-col gap-14 px-5 pb-20 pt-6">
      {currentMember ? (
        <PersonCard member={currentMember} isOwnCard priority />
      ) : null}

      {showSectionHeader ? (
        <section className="space-y-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
              For You
            </p>
            <h2 className="mt-2 text-[24px] font-light tracking-tight text-foreground">
              あなたへのおすすめ
            </h2>
          </div>

          <div className="flex flex-col gap-14">
            {feedItems.map(({ member, recommendation, reason, resonanceStatus }) => (
              <PersonCard
                key={member.id}
                member={member}
                recommendation={recommendation}
                resonanceReason={reason}
                resonanceStatus={resonanceStatus}
              />
            ))}
          </div>
        </section>
      ) : (
        feedItems.map(({ member, recommendation, reason, resonanceStatus }, index) => (
          <PersonCard
            key={member.id}
            member={member}
            recommendation={recommendation}
            resonanceReason={reason}
            resonanceStatus={resonanceStatus}
            priority={index === 0}
          />
        ))
      )}

      {initialFeedPage.hasMore ? (
        <HomeFeedInfinite
          viewerId={viewerId}
          initialOffset={initialFeedPage.nextOffset ?? INITIAL_FEED_PAGE_SIZE}
        />
      ) : null}
    </div>
  );
}
