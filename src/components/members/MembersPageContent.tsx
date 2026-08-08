"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppPageHeader } from "@/components/navigation/AppPageHeader";
import { MemberListCard } from "@/components/members/MemberListCard";
import { MembersFilterSheet } from "@/components/members/MembersFilterSheet";
import { SeoFooterLinks } from "@/components/seo/SeoFooterLinks";
import { Button } from "@/components/ui/button";
import { getActivityStyleLabel } from "@/lib/music/activity-style";
import {
  EMPTY_MEMBERS_FILTER,
  hasMembersFilter,
  memberMatchesMembersFilter,
  type MembersFilterState,
} from "@/lib/members/filters";
import { MEMBERS_SEO } from "@/lib/seo/about-copy";
import type { Member } from "@/types/member";

type MembersPageContentProps = {
  members: Member[];
  spotlightMembers?: Member[];
  spotlightTitle?: string;
};

export function MembersPageContent({
  members,
  spotlightMembers = [],
  spotlightTitle = "今日登録した人",
}: MembersPageContentProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState<MembersFilterState>(EMPTY_MEMBERS_FILTER);

  const filteredMembers = useMemo(() => {
    if (!hasMembersFilter(filter)) {
      return members;
    }

    return members.filter((member) => memberMatchesMembersFilter(member, filter));
  }, [members, filter]);

  const hasActiveFilter = hasMembersFilter(filter);

  function clearFilters() {
    setFilter(EMPTY_MEMBERS_FILTER);
  }

  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <AppPageHeader
        backHref="/"
        backLabel="トップに戻る"
        eyebrow={MEMBERS_SEO.eyebrow}
        title={MEMBERS_SEO.title}
        subtitle={MEMBERS_SEO.lead}
      />

      <div className="space-y-10 px-5 pb-16">
        <section className="space-y-4">
          {MEMBERS_SEO.intro.map((paragraph) => (
            <p
              key={paragraph}
              className="text-[16px] leading-[1.85] text-white/70"
            >
              {paragraph}
            </p>
          ))}
        </section>

        {spotlightMembers.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-[18px] font-medium tracking-tight text-foreground">
              {spotlightTitle}
            </h2>
            <ul className="space-y-3">
              {spotlightMembers.map((member) => (
                <li key={member.id}>
                  <MemberListCard member={member} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[18px] font-medium tracking-tight text-foreground">
              音楽仲間・メンバー募集
            </h2>
            {hasActiveFilter ? (
              <button
                type="button"
                onClick={clearFilters}
                className="shrink-0 text-[13px] text-white/45 transition-colors hover:text-primary"
              >
                絞り込み解除
              </button>
            ) : null}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setFilterOpen(true)}
          >
            メンバーを探す
          </Button>

          {filter.part ? (
            <p className="text-[14px] text-white/50">
              {filter.part} のメンバーを表示しています
            </p>
          ) : null}
          {filter.activityStyle ? (
            <p className="text-[14px] text-white/50">
              {getActivityStyleLabel(filter.activityStyle)} のメンバーを表示しています
            </p>
          ) : null}

          {filteredMembers.length > 0 ? (
            <ul className="space-y-3">
              {filteredMembers.map((member) => (
                <li key={member.id}>
                  <MemberListCard member={member} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-[18px] border border-border/80 bg-subtle/60 px-5 py-4 text-[15px] text-white/55">
              {hasActiveFilter
                ? "条件に合うメンバーは見つかりませんでした。"
                : "現在、公開中のメンバーは準備中です。"}
              {hasActiveFilter ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 block text-primary"
                >
                  すべてのメンバーを表示
                </button>
              ) : (
                <Link href="/welcome" className="mt-2 block text-primary">
                  プロフィールを作って参加する
                </Link>
              )}
            </p>
          )}
        </section>

        <section className="rounded-[22px] border border-border/80 bg-subtle/60 px-5 py-6">
          <h2 className="text-[18px] font-medium tracking-tight text-foreground">
            RESONOとは
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/60">
            好きな音楽が合う人を見つけて、一緒にバンドを始めるためのサービス。
          </p>
          <Link
            href="/about"
            className="mt-4 inline-flex text-[15px] text-primary transition-colors hover:text-primary/80"
          >
            RESONOについて
          </Link>
        </section>

        <SeoFooterLinks />
      </div>

      <MembersFilterSheet
        open={filterOpen}
        value={filter}
        onClose={() => setFilterOpen(false)}
        onApply={setFilter}
      />
    </main>
  );
}
