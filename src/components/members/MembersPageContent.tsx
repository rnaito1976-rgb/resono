"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SelectableChip } from "@/components/onboarding/SelectableChip";
import { AppPageHeader } from "@/components/navigation/AppPageHeader";
import { MemberListCard } from "@/components/members/MemberListCard";
import { MemberListRow } from "@/components/members/MemberListRow";
import { MembersViewToggle } from "@/components/members/MembersViewToggle";
import { SeoFooterLinks } from "@/components/seo/SeoFooterLinks";
import {
  ACTIVITY_STYLE_OPTIONS,
  getActivityStyleLabel,
  type ActivityStyleId,
} from "@/lib/music/activity-style";
import {
  collectArtistFilters,
  memberMatchesArtist,
} from "@/lib/members/music-hints";
import {
  readMembersViewMode,
  writeMembersViewMode,
  type MembersViewMode,
} from "@/lib/members/view-mode";
import { MEMBERS_SEO } from "@/lib/seo/about-copy";
import type { Member } from "@/types/member";

const FEATURED_ARTISTS = [
  "Radiohead",
  "ELLEGARDEN",
  "King Gnu",
  "羊文学",
  "サカナクション",
] as const;

type MembersPageContentProps = {
  members: Member[];
  spotlightMembers?: Member[];
  spotlightTitle?: string;
};

function memberMatchesPart(member: Member, part: string) {
  return (
    member.music.instruments.includes(part) || member.lookingFor.parts.includes(part)
  );
}

function memberMatchesActivityStyle(member: Member, styleId: ActivityStyleId) {
  return member.music.activityStyle === styleId;
}

export function MembersPageContent({
  members,
  spotlightMembers = [],
  spotlightTitle = "今日登録した人",
}: MembersPageContentProps) {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [selectedActivityStyle, setSelectedActivityStyle] =
    useState<ActivityStyleId | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<MembersViewMode>("card");

  useEffect(() => {
    const stored = readMembersViewMode();
    if (stored) {
      setViewMode(stored);
    }
  }, []);

  function handleViewModeChange(mode: MembersViewMode) {
    setViewMode(mode);
    writeMembersViewMode(mode);
  }

  const artistFilters = useMemo(() => {
    const fromMembers = collectArtistFilters(members, 8);
    const merged = [...FEATURED_ARTISTS, ...fromMembers];
    return [...new Set(merged)].slice(0, 12);
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      if (selectedPart && !memberMatchesPart(member, selectedPart)) {
        return false;
      }

      if (
        selectedActivityStyle &&
        !memberMatchesActivityStyle(member, selectedActivityStyle)
      ) {
        return false;
      }

      if (selectedArtist && !memberMatchesArtist(member, selectedArtist)) {
        return false;
      }

      return true;
    });
  }, [members, selectedPart, selectedActivityStyle, selectedArtist]);

  const hasActiveFilter = Boolean(
    selectedPart || selectedActivityStyle || selectedArtist
  );

  function clearFilters() {
    setSelectedPart(null);
    setSelectedActivityStyle(null);
    setSelectedArtist(null);
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
          <h2 className="text-[18px] font-medium tracking-tight text-foreground">
            好きなアーティストから探す
          </h2>
          <ul className="flex flex-wrap gap-2.5">
            {artistFilters.map((artist) => (
              <li key={artist}>
                <SelectableChip
                  label={artist}
                  selected={selectedArtist === artist}
                  onToggle={() =>
                    setSelectedArtist((current) =>
                      current === artist ? null : artist
                    )
                  }
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-[18px] font-medium tracking-tight text-foreground">
            {MEMBERS_SEO.partsHeading}
          </h2>
          <ul className="flex flex-wrap gap-2.5">
            {MEMBERS_SEO.parts.map((part) => (
              <li key={part}>
                <SelectableChip
                  label={part}
                  selected={selectedPart === part}
                  onToggle={() =>
                    setSelectedPart((current) => (current === part ? null : part))
                  }
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-[18px] font-medium tracking-tight text-foreground">
            活動スタイルから探す
          </h2>
          <p className="text-[14px] leading-relaxed text-white/45">
            どんなバンド活動をしたいかで絞り込めます。
          </p>
          <ul className="flex flex-wrap gap-2.5">
            {ACTIVITY_STYLE_OPTIONS.map((option) => (
              <li key={option.id}>
                <SelectableChip
                  label={option.label}
                  selected={selectedActivityStyle === option.id}
                  onToggle={() =>
                    setSelectedActivityStyle((current) =>
                      current === option.id ? null : option.id
                    )
                  }
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[18px] font-medium tracking-tight text-foreground">
              音楽仲間・メンバー募集
            </h2>
            <div className="flex shrink-0 items-center gap-2.5">
              <MembersViewToggle value={viewMode} onChange={handleViewModeChange} />
              {hasActiveFilter ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[13px] text-white/45 transition-colors hover:text-primary"
                >
                  絞り込み解除
                </button>
              ) : null}
            </div>
          </div>

          {selectedArtist ? (
            <p className="text-[14px] text-white/50">
              {selectedArtist} が好きな人を表示しています
            </p>
          ) : null}
          {selectedPart ? (
            <p className="text-[14px] text-white/50">
              {selectedPart} のメンバーを表示しています
            </p>
          ) : null}
          {selectedActivityStyle ? (
            <p className="text-[14px] text-white/50">
              {getActivityStyleLabel(selectedActivityStyle)} のメンバーを表示しています
            </p>
          ) : null}

          {filteredMembers.length > 0 ? (
            viewMode === "card" ? (
              <ul className="grid grid-cols-2 gap-3">
                {filteredMembers.map((member) => (
                  <li key={member.id} className="min-w-0">
                    <MemberListCard member={member} layout="grid" />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2">
                {filteredMembers.map((member) => (
                  <li key={member.id}>
                    <MemberListRow member={member} />
                  </li>
                ))}
              </ul>
            )
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
    </main>
  );
}
