"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { MemberListRow } from "@/components/members/MemberListRow";
import { useMembersViewModeOptional } from "@/components/members/MembersViewProvider";
import { HomeFeedSkeleton } from "@/components/skeletons/HomeFeedSkeleton";
import { PersonCardClient } from "@/components/person-card/PersonCardClient";
import { RecruitmentApplicationsPrefetch } from "@/components/recruitment/RecruitmentApplicationsPrefetch";
import {
  dedupeFeedItems,
  FEED_PAGE_SIZE,
  INITIAL_FEED_PAGE_SIZE,
  type MembersFeedPage,
} from "@/lib/members/feed";
import { seedRecruitmentAppliedCache } from "@/lib/recruitment/cache";
import { queryKeys } from "@/lib/query/keys";
import { RESONANCE_CHANGE_EVENT } from "@/lib/resonance";
import type { ResonanceStatus } from "@/lib/resonance/status";
import type { InfiniteData } from "@tanstack/react-query";

const FEED_CACHE_PREFIX = "resono:home-feed:v6:";
const FEED_CACHE_TTL_MS = 2 * 60 * 1000;
const FEED_STALE_MS = 2 * 60 * 1000;

type HomeFeedListProps = {
  viewerId?: string;
  viewerMemberId?: string;
  showSectionHeader?: boolean;
  initialFeedPage?: MembersFeedPage;
  initialAppliedByTarget?: Record<string, string[]>;
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

async function fetchFeedPage(
  excludeIds: string[],
  limit: number
): Promise<MembersFeedPage> {
  const params = new URLSearchParams({
    limit: String(limit),
    fast: "1",
  });

  if (excludeIds.length > 0) {
    params.set("exclude", excludeIds.join(","));
  }

  const response = await fetch(`/api/members/feed?${params.toString()}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error("フィードの取得に失敗しました");
  }

  return response.json();
}

export function HomeFeedList({
  viewerId,
  viewerMemberId,
  showSectionHeader = false,
  initialFeedPage,
  initialAppliedByTarget = {},
}: HomeFeedListProps) {
  const viewContext = useMembersViewModeOptional();
  const viewMode = viewContext?.viewMode ?? "card";
  const queryClient = useQueryClient();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const cachedFirstPage = useRef(initialFeedPage ?? readFeedCache(viewerId));
  const initialHasReasons = initialFeedPage ? feedItemsHaveReasons(initialFeedPage) : true;
  const seededAppliedRef = useRef(false);

  useLayoutEffect(() => {
    if (seededAppliedRef.current || Object.keys(initialAppliedByTarget).length === 0) {
      return;
    }

    seedRecruitmentAppliedCache(queryClient, initialAppliedByTarget);
    seededAppliedRef.current = true;
  }, [initialAppliedByTarget, queryClient]);

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: queryKeys.members.feed(viewerId),
      queryFn: ({ pageParam }) => {
        const excludeIds = pageParam as string[];
        return fetchFeedPage(
          excludeIds,
          excludeIds.length === 0 ? INITIAL_FEED_PAGE_SIZE : FEED_PAGE_SIZE
        );
      },
      initialPageParam: [] as string[],
      initialData: cachedFirstPage.current
        ? { pages: [cachedFirstPage.current], pageParams: [[]] }
        : undefined,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage.hasMore) {
          return undefined;
        }

        return allPages.flatMap((page) => page.items.map((item) => item.member.id));
      },
      staleTime: initialHasReasons ? FEED_STALE_MS : 45 * 1000,
      refetchOnMount: !initialFeedPage || !initialHasReasons,
      refetchOnWindowFocus: false,
    });

  const feedItems = dedupeFeedItems(data?.pages.flatMap((page) => page.items) ?? []);
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

  const cardFeed = feedItems.map(({ member, recommendation, reason, resonanceStatus }, index) => (
    <PersonCardClient
      key={member.id}
      member={member}
      recommendation={recommendation}
      resonanceReason={reason}
      resonanceStatus={resonanceStatus}
      priority={!showSectionHeader && index === 0}
      initialAppliedParts={initialAppliedByTarget[member.id] ?? undefined}
    />
  ));

  const listFeed = (
    <ul className="space-y-2">
      {feedItems.map(({ member }) => (
        <li key={member.id}>
          <MemberListRow member={member} />
        </li>
      ))}
    </ul>
  );

  const feedContent = viewMode === "card" ? (
    <div className="flex flex-col gap-14">{cardFeed}</div>
  ) : (
    listFeed
  );

  const prefetch =
    viewMode === "card" ? (
      <RecruitmentApplicationsPrefetch
        members={feedItems.map((item) => item.member)}
        viewerMemberId={viewerMemberId}
      />
    ) : null;

  if (showSectionHeader) {
    return (
      <>
        {prefetch}
        <section className="space-y-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
              Discover
            </p>
            <h2 className="mt-2 text-[24px] font-light tracking-tight text-foreground">
              音楽的に気になる人
            </h2>
          </div>
          {feedContent}
        </section>
        {isFetchingNextPage ? <HomeFeedSkeleton count={1} /> : null}
        <div ref={loadMoreRef} aria-hidden className="h-8" />
      </>
    );
  }

  return (
    <>
      {prefetch}
      {feedContent}
      {isFetchingNextPage ? <HomeFeedSkeleton count={1} /> : null}
      <div ref={loadMoreRef} aria-hidden className="h-8" />
    </>
  );
}
