"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { HomeFeedSkeleton } from "@/components/skeletons/HomeFeedSkeleton";
import { PersonCardClient } from "@/components/person-card/PersonCardClient";
import {
  FEED_PAGE_SIZE,
  INITIAL_FEED_PAGE_SIZE,
  type MembersFeedPage,
} from "@/lib/members/feed";
import { queryKeys } from "@/lib/query/keys";
import { RESONANCE_CHANGE_EVENT } from "@/lib/resonance";
import type { ResonanceStatus } from "@/lib/resonance/status";
import type { InfiniteData } from "@tanstack/react-query";

const FEED_CACHE_PREFIX = "resono:home-feed:v5:";
const FEED_CACHE_TTL_MS = 2 * 60 * 1000;
const FEED_STALE_MS = 2 * 60 * 1000;

type HomeFeedListProps = {
  viewerId?: string;
  showSectionHeader?: boolean;
  initialFeedPage?: MembersFeedPage;
};

function getFeedCacheKey(viewerId?: string) {
  return `${FEED_CACHE_PREFIX}${viewerId ?? "anonymous"}`;
}

function feedItemsHaveReasons(page: MembersFeedPage) {
  return page.items.every((item) => Number.isFinite(item.reason?.score));
}

function readFeedCache(viewerId?: string): MembersFeedPage | undefined {
  if (typeof window === "undefined" || !viewerId) {
    return undefined;
  }

  try {
    const raw = sessionStorage.getItem(getFeedCacheKey(viewerId));
    if (!raw) {
      return undefined;
    }

    const parsed = JSON.parse(raw) as { savedAt: number; page: MembersFeedPage };
    if (Date.now() - parsed.savedAt > FEED_CACHE_TTL_MS) {
      sessionStorage.removeItem(getFeedCacheKey(viewerId));
      return undefined;
    }

    if (!feedItemsHaveReasons(parsed.page)) {
      sessionStorage.removeItem(getFeedCacheKey(viewerId));
      return undefined;
    }

    return parsed.page;
  } catch {
    return undefined;
  }
}

function writeFeedCache(viewerId: string | undefined, page: MembersFeedPage) {
  if (!viewerId || !feedItemsHaveReasons(page)) {
    return;
  }

  try {
    sessionStorage.setItem(
      getFeedCacheKey(viewerId),
      JSON.stringify({ savedAt: Date.now(), page })
    );
  } catch {
    // Ignore quota errors.
  }
}

async function fetchFeedPage(offset: number, limit: number): Promise<MembersFeedPage> {
  const response = await fetch(
    `/api/members/feed?offset=${offset}&limit=${limit}&fast=1`,
    { credentials: "same-origin" }
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
  const queryClient = useQueryClient();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const cachedFirstPage = useRef(initialFeedPage ?? readFeedCache(viewerId));
  const initialHasReasons = initialFeedPage ? feedItemsHaveReasons(initialFeedPage) : true;

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: queryKeys.members.feed(viewerId),
      queryFn: ({ pageParam }) =>
        fetchFeedPage(
          pageParam,
          pageParam === 0 ? INITIAL_FEED_PAGE_SIZE : FEED_PAGE_SIZE
        ),
      initialPageParam: 0,
      initialData: cachedFirstPage.current
        ? { pages: [cachedFirstPage.current], pageParams: [0] }
        : undefined,
      getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
      staleTime: initialHasReasons ? FEED_STALE_MS : 45 * 1000,
      refetchOnMount: !initialFeedPage || !initialHasReasons,
      refetchOnWindowFocus: false,
    });

  const feedItems = data?.pages.flatMap((page) => page.items) ?? [];
  const firstPage = data?.pages[0];

  useEffect(() => {
    if (firstPage) {
      writeFeedCache(viewerId, firstPage);
    }
  }, [firstPage, viewerId]);

  useEffect(() => {
    const handleResonanceChange = () => {
      queryClient.setQueryData<InfiniteData<MembersFeedPage>>(
        queryKeys.members.feed(viewerId),
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              items: page.items.map((item) => {
                const status = queryClient.getQueryData<ResonanceStatus>(
                  queryKeys.resonance.status(item.member.id)
                );

                return status ? { ...item, resonanceStatus: status } : item;
              }),
            })),
          };
        }
      );
    };

    window.addEventListener(RESONANCE_CHANGE_EVENT, handleResonanceChange);

    return () => {
      window.removeEventListener(RESONANCE_CHANGE_EVENT, handleResonanceChange);
    };
  }, [queryClient, viewerId]);

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
      // Prefetch well before the user reaches the end.
      rootMargin: "1200px 0px",
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, [handleObserver, hasNextPage]);

  if (isLoading) {
    return <HomeFeedSkeleton count={showSectionHeader ? 2 : 3} />;
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
        <div ref={loadMoreRef} aria-hidden className="h-8" />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-14">{cards}</div>
      {isFetchingNextPage ? <HomeFeedSkeleton count={1} /> : null}
      <div ref={loadMoreRef} aria-hidden className="h-8" />
    </>
  );
}
