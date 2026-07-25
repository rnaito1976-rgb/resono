"use client";

import dynamic from "next/dynamic";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { HomeFeedSkeleton } from "@/components/skeletons/HomeFeedSkeleton";
import { PersonCardSkeleton } from "@/components/skeletons/PersonCardSkeleton";
import {
  FEED_PAGE_SIZE,
  INITIAL_FEED_PAGE_SIZE,
  type MembersFeedPage,
} from "@/lib/members/feed";
import { queryKeys } from "@/lib/query/keys";

const PersonCardClient = dynamic(
  () =>
    import("@/components/person-card/PersonCardClient").then(
      (module) => module.PersonCardClient
    ),
  { loading: () => <PersonCardSkeleton /> }
);

type HomeFeedListProps = {
  viewerId?: string;
  showSectionHeader?: boolean;
  initialFeedPage?: MembersFeedPage;
};

async function fetchFeedPage(offset: number, limit: number): Promise<MembersFeedPage> {
  const response = await fetch(
    `/api/members/feed?offset=${offset}&limit=${limit}&fast=1`
  );

  if (!response.ok) {
    throw new Error("フィードの取得に失敗しました");
  }

  return response.json();
}

export function HomeFeedList({
  viewerId,
  showSectionHeader = false,
  initialFeedPage,
}: HomeFeedListProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: queryKeys.members.feed(viewerId),
      queryFn: ({ pageParam }) =>
        fetchFeedPage(
          pageParam,
          pageParam === 0 ? INITIAL_FEED_PAGE_SIZE : FEED_PAGE_SIZE
        ),
      initialPageParam: 0,
      initialData: initialFeedPage
        ? { pages: [initialFeedPage], pageParams: [0] }
        : undefined,
      getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
      staleTime: 5 * 60 * 1000,
    });

  const feedItems = data?.pages.flatMap((page) => page.items) ?? [];

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

  if (isLoading) {
    return <HomeFeedSkeleton count={showSectionHeader ? 3 : 4} />;
  }

  if (error) {
    return (
      <p className="text-center text-[14px] text-red-300">
        おすすめの読み込みに失敗しました
      </p>
    );
  }

  const cards = feedItems.map(({ member, recommendation, reason, resonanceStatus }, index) => (
    <PersonCardClient
      key={member.id}
      member={member}
      recommendation={recommendation}
      resonanceReason={reason}
      resonanceStatus={resonanceStatus}
      priority={!showSectionHeader && index === 0}
    />
  ));

  if (showSectionHeader) {
    return (
      <>
        <section className="space-y-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
              For You
            </p>
            <h2 className="mt-2 text-[24px] font-light tracking-tight text-foreground">
              あなたへのおすすめ
            </h2>
          </div>
          <div className="flex flex-col gap-14">{cards}</div>
        </section>
        {isFetchingNextPage ? <HomeFeedSkeleton count={1} /> : null}
        <div ref={loadMoreRef} aria-hidden className="h-1" />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-14">{cards}</div>
      {isFetchingNextPage ? <HomeFeedSkeleton count={1} /> : null}
      <div ref={loadMoreRef} aria-hidden className="h-1" />
    </>
  );
}
