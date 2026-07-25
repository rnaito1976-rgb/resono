"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { DETAIL_SECTIONS, getOwnProfileDetailSections, type DetailSection } from "@/types/member";
import { AppPageHeader } from "@/components/navigation/AppPageHeader";
import { AppSubNav } from "@/components/navigation/AppSubNav";
import { HeaderActionLink } from "@/components/navigation/HeaderActionLink";
import { ResonateButton } from "@/components/ResonateButton";
import { MemberDetailSkeleton } from "@/components/skeletons/MemberDetailSkeleton";
import type { ResonanceStatus } from "@/lib/resonance/status";
import type { Member } from "@/types/member";

const SlideFallback = () => (
  <div className="px-6 py-8">
    <div className="h-72 animate-pulse rounded-3xl bg-white/[0.06]" />
  </div>
);

/** ⑦ Dynamic Import: スライドをルート分割し初回JSを削減 */
const PortraitSlide = dynamic(
  () =>
    import("@/components/member-detail/slides/PortraitSlide").then((module) => ({
      default: module.PortraitSlide,
    })),
  { loading: SlideFallback }
);

const MusicSlide = dynamic(
  () =>
    import("@/components/member-detail/slides/MusicSlide").then((module) => ({
      default: module.MusicSlide,
    })),
  { loading: SlideFallback }
);

const LookingForSlide = dynamic(
  () =>
    import("@/components/member-detail/slides/LookingForSlide").then((module) => ({
      default: module.LookingForSlide,
    })),
  { loading: SlideFallback }
);

const ActivitySlide = dynamic(
  () =>
    import("@/components/member-detail/slides/ActivitySlide").then((module) => ({
      default: module.ActivitySlide,
    })),
  { loading: SlideFallback }
);

export type MemberDetailFrameProps = {
  member: Member;
  isOwnProfile?: boolean;
  resonanceReason?: import("@/lib/resonance/matching").ResonanceReason;
  resonanceStatus?: ResonanceStatus;
  showResonateButton?: boolean;
  mutualMembers?: import("@/types/band").MutualResonateMember[];
  bandActivities?: import("@/types/band").BandActivityFeedItem[];
  memberActivities?: import("@/types/activity").MemberActivityFeedItem[];
  variant?: "page" | "sheet";
  onClose?: () => void;
  priorityPhoto?: boolean;
  headerSlot?: ReactNode;
};

export function MemberDetailFrame({
  member,
  isOwnProfile = false,
  resonanceReason,
  resonanceStatus,
  showResonateButton = false,
  mutualMembers = [],
  bandActivities = [],
  memberActivities = [],
  variant = "page",
  onClose,
  priorityPhoto = false,
  headerSlot,
}: MemberDetailFrameProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isSheet = variant === "sheet";
  const hasActivityContent = isOwnProfile && memberActivities.length > 0;
  const sections = isOwnProfile
    ? getOwnProfileDetailSections(hasActivityContent)
    : DETAIL_SECTIONS;
  const containerClass = isSheet
    ? "flex h-full min-h-0 flex-col bg-background"
    : "flex h-dvh flex-col bg-background";

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({
      left: index * container.clientWidth,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const index = Math.round(container.scrollLeft / container.clientWidth);
      setActiveIndex(index);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  function renderSlide(sectionId: DetailSection) {
    switch (sectionId) {
      case "portrait":
        return (
          <PortraitSlide
            member={member}
            resonanceReason={resonanceReason}
            isOwnProfile={isOwnProfile}
            priorityPhoto={priorityPhoto}
          />
        );
      case "music":
        return <MusicSlide member={member} isOwnProfile={isOwnProfile} />;
      case "lookingFor":
        return (
          <LookingForSlide
            member={member}
            isOwnProfile={isOwnProfile}
            mutualMembers={mutualMembers}
            bandActivities={isOwnProfile ? [] : bandActivities}
          />
        );
      case "activity":
        return <ActivitySlide activities={memberActivities} />;
    }
  }

  return (
    <div className={containerClass}>
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl">
        {headerSlot ?? (
          <>
            {isSheet ? (
              <div className="flex items-center justify-between px-5 pb-2 pt-1">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
                    Profile
                  </p>
                  <h1 className="truncate text-[20px] font-light tracking-tight">
                    {isOwnProfile ? "マイページ" : member.name}
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="閉じる"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-white/80"
                >
                  ×
                </button>
              </div>
            ) : isOwnProfile ? (
              <AppPageHeader
                backHref="/"
                backLabel="ホームに戻る"
                eyebrow="Profile"
                title="マイページ"
                subtitle="あなたの音楽活動をまとめて見る。"
                actions={
                  <>
                    <HeaderActionLink href={`/member/${member.id}/edit`}>編集</HeaderActionLink>
                <HeaderActionLink href="/discover" variant="primary">
                  Discover a Story
                </HeaderActionLink>
                  </>
                }
              />
            ) : (
              <AppPageHeader
                backHref="/"
                backLabel="ホームに戻る"
                eyebrow="Profile"
                title={member.name}
              />
            )}

            <AppSubNav
              items={sections}
              activeIndex={activeIndex}
              onSelect={scrollToIndex}
            />
          </>
        )}
      </header>

      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden scrollbar-hide"
      >
        {sections.map((section) => (
          <section
            key={section.id}
            className="h-full min-h-0 w-full flex-shrink-0 snap-start snap-always overflow-y-auto overscroll-y-contain"
          >
            {renderSlide(section.id)}
          </section>
        ))}
      </div>

      <div className="bg-background px-5 pb-8 pt-4">
        <div className="mb-4 flex justify-center gap-1.5">
          {sections.map((section, index) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={section.label}
              className={`h-1 rounded-full transition-all ${
                activeIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/25"
              }`}
            />
          ))}
        </div>
        {showResonateButton ? (
          <ResonateButton memberId={member.id} initialStatus={resonanceStatus} />
        ) : null}
      </div>
    </div>
  );
}

export function MemberDetailFrameLoading({ variant = "page" }: { variant?: "page" | "sheet" }) {
  return <MemberDetailSkeleton variant={variant === "sheet" ? "sheet" : "page"} />;
}
