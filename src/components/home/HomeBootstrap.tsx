"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { AppHeader } from "@/components/AppHeader";
import { HomeFeedList } from "@/components/home/HomeFeedList";
import { HomePageSkeleton } from "@/components/skeletons/HomePageSkeleton";
import type { HomeBootstrapPayload } from "@/lib/home/bootstrap";
import { applyFrequencyColorVariables } from "@/lib/frequency-color/css";
import { getNextImagePreloadHref } from "@/lib/images/lcp";
import { HOME_LCP_IMAGE_WIDTH } from "@/lib/images/lcp";
import { queryKeys } from "@/lib/query/keys";

const PersonCardClient = dynamic(
  () =>
    import("@/components/person-card/PersonCardClient").then(
      (module) => module.PersonCardClient
    ),
  { loading: () => null }
);

async function fetchHomeBootstrap(): Promise<HomeBootstrapPayload> {
  const response = await fetch("/api/home/bootstrap", { credentials: "same-origin" });

  if (!response.ok) {
    throw new Error("ホームの読み込みに失敗しました");
  }

  return response.json();
}

export function HomeBootstrap() {
  const router = useRouter();

  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.home.bootstrap(),
    queryFn: fetchHomeBootstrap,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    if (data.frequencyColor) {
      applyFrequencyColorVariables(document.documentElement, data.frequencyColor);
    }

    if (data.redirect) {
      router.replace(data.redirect);
      return;
    }

    if (data.member?.photo) {
      const href = getNextImagePreloadHref(data.member.photo, HOME_LCP_IMAGE_WIDTH);
      if (!href) {
        return;
      }

      const existing = document.querySelector(`link[rel="preload"][href="${href}"]`);
      if (existing) {
        return;
      }

      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = href;
      link.fetchPriority = "high";
      document.head.appendChild(link);
    }
  }, [data, router]);

  if (isLoading || data?.redirect) {
    return <HomePageSkeleton />;
  }

  if (error || !data) {
    return (
      <main className="mx-auto min-h-dvh max-w-mobile bg-background px-5 pb-20 pt-24">
        <p className="text-center text-[14px] text-red-300">
          読み込みに失敗しました。ページを再読み込みしてください。
        </p>
      </main>
    );
  }

  const user = data.user as User | null;
  const showSectionHeader = Boolean(data.member && data.feed.items.length > 0);

  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <AppHeader initialUser={user} />
      <div className="flex flex-col gap-14 px-5 pb-20 pt-6">
        {data.member ? (
          <PersonCardClient member={data.member} isOwnCard priority />
        ) : null}
        <HomeFeedList
          viewerId={data.member?.id ?? user?.id}
          showSectionHeader={showSectionHeader}
          initialFeedPage={data.feed}
        />
      </div>
    </main>
  );
}
