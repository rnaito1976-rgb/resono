"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { DETAIL_SECTIONS } from "@/types/member";
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

export type MemberDetailFrameProps = {
  member: Member;
  isOwnProfile?: boolean;
  resonanceReason?: import("@/lib/resonance/matching").ResonanceReason;
  resonanceStatus?: ResonanceStatus;
  showResonateButton?: boolean;
  mutualMembers?: import("@/types/band").MutualResonateMember[];
  bandActivities?: import("@/types/band").BandActivityFeedItem[];
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
  variant = "page",
  onClose,
  priorityPhoto = false,
  headerSlot,
}: MemberDetailFrameProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isSheet = variant === "sheet";
  const containerClass = isSheet
    ? "flex h-[80dvh] flex-col bg-background"
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
                actions={
                  <>
                    <HeaderActionLink href={`/member/${member.id}/edit`}>編集</HeaderActionLink>
                    <HeaderActionLink href="/discover" variant="primary">
                      AIと話す
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
              items={DETAIL_SECTIONS}
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
        <section className="h-full min-h-0 w-full flex-shrink-0 snap-start snap-always overflow-y-auto overscroll-y-contain">
          <PortraitSlide
            member={member}
            resonanceReason={resonanceReason}
            isOwnProfile={isOwnProfile}
            priorityPhoto={priorityPhoto}
          />
        </section>
        <section className="h-full min-h-0 w-full flex-shrink-0 snap-start snap-always overflow-y-auto overscroll-y-contain">
          <MusicSlide member={member} isOwnProfile={isOwnProfile} />
        </section>
        <section className="h-full min-h-0 w-full flex-shrink-0 snap-start snap-always overflow-y-auto overscroll-y-contain">
          <LookingForSlide
            member={member}
            isOwnProfile={isOwnProfile}
            mutualMembers={mutualMembers}
            bandActivities={bandActivities}
          />
        </section>
      </div>

      <div className="bg-background px-5 pb-8 pt-4">
        <div className="mb-4 flex justify-center gap-1.5">
          {DETAIL_SECTIONS.map((section, index) => (
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
        {isOwnProfile ? (
          <Link
            href="/discover"
            className="flex h-12 w-full items-center justify-center rounded-full border border-border text-[15px] font-medium tracking-wide text-white/80 transition-quiet active:opacity-70"
          >
            AIと少し話す
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function MemberDetailFrameLoading({ variant = "page" }: { variant?: "page" | "sheet" }) {
  return <MemberDetailSkeleton variant={variant === "sheet" ? "sheet" : "page"} />;
}
