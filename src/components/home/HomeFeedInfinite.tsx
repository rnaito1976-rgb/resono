"use client";

import dynamic from "next/dynamic";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { HomeFeedSkeleton } from "@/components/skeletons/HomeFeedSkeleton";
import { PersonCardSkeleton } from "@/components/skeletons/PersonCardSkeleton";
import { FEED_PAGE_SIZE, type MembersFeedPage } from "@/lib/members/feed";
import { queryKeys } from "@/lib/query/keys";

const PersonCardClient = dynamic(
  () =>
    import("@/components/person-card/PersonCardClient").then(
      (module) => module.PersonCardClient
    ),
  { loading: () => <PersonCardSkeleton /> }
);

type HomeFeedInfiniteProps = {
  viewerId?: string;
  initialOffset: number;
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

export function HomeFeedInfinite({ viewerId, initialOffset }: HomeFeedInfiniteProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: queryKeys.members.feed(viewerId),
      queryFn: ({ pageParam }) => fetchFeedPage(pageParam),
      initialPageParam: initialOffset,
      getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
      staleTime: 5 * 60 * 1000,
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

  const extraItems = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      {error ? (
        <p className="text-center text-[14px] text-red-300">
          おすすめの読み込みに失敗しました
        </p>
      ) : null}

      {extraItems.length > 0 ? (
        <div className="flex flex-col gap-14">
          {extraItems.map(({ member, recommendation, reason, resonanceStatus }) => (
            <PersonCardClient
              key={member.id}
              member={member}
              recommendation={recommendation}
              resonanceReason={reason}
              resonanceStatus={resonanceStatus}
            />
          ))}
        </div>
      ) : null}

      {isFetchingNextPage ? <HomeFeedSkeleton count={1} /> : null}

      <div ref={loadMoreRef} aria-hidden className="h-1" />
    </>
  );
}
