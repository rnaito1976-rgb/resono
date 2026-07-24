"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { PersonCard } from "@/components/PersonCard";
import { HomeFeedSkeleton } from "@/components/skeletons/HomeFeedSkeleton";
import { FEED_PAGE_SIZE, type MembersFeedPage } from "@/lib/members/feed";
import { queryKeys } from "@/lib/query/keys";
import type { Member } from "@/types/member";

type HomeFeedProps = {
  viewerId?: string;
  currentMember?: Member;
  initialFeedPage?: MembersFeedPage;
};

async function fetchFeedPage(offset: number): Promise<MembersFeedPage> {
  const response = await fetch(
    `/api/members/feed?offset=${offset}&limit=${FEED_PAGE_SIZE}`
  );

  if (!response.ok) {
    throw new Error("フィードの取得に失敗しました");
  }

  return response.json();
}

export function HomeFeed({
  viewerId,
  currentMember,
  initialFeedPage,
}: HomeFeedProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: queryKeys.members.feed(viewerId),
    queryFn: ({ pageParam }) => fetchFeedPage(pageParam),
    initialPageParam: 0,
    initialData: initialFeedPage
      ? { pages: [initialFeedPage], pageParams: [0] }
      : undefined,
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    staleTime: 2 * 60 * 1000,
  });

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "240px 0px",
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, [handleObserver, hasNextPage]);

  const feedItems = data?.pages.flatMap((page) => page.items) ?? [];
  const showSectionHeader = Boolean(currentMember && feedItems.length > 0);

  return (
    <div className="flex flex-col gap-14 px-5 pb-20 pt-6">
      {currentMember ? (
        <PersonCard member={currentMember} isOwnCard priority />
      ) : null}

      {isLoading ? <HomeFeedSkeleton count={3} /> : null}

      {error ? (
        <p className="text-center text-[14px] text-red-300">
          おすすめの読み込みに失敗しました
        </p>
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
        !isLoading &&
        feedItems.map(({ member, recommendation, reason, resonanceStatus }) => (
          <PersonCard
            key={member.id}
            member={member}
            recommendation={recommendation}
            resonanceReason={reason}
            resonanceStatus={resonanceStatus}
          />
        ))
      )}

      {isFetchingNextPage ? <HomeFeedSkeleton count={1} /> : null}

      <div ref={loadMoreRef} aria-hidden className="h-1" />
    </div>
  );
}
