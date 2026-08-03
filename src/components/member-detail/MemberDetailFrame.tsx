"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { DETAIL_SECTIONS, getOwnProfileDetailSections, type DetailSection } from "@/types/member";
import { MemberThemeScope } from "@/components/frequency-color/MemberThemeScope";
import { AppTopBar } from "@/components/navigation/AppTopBar";
import { AppSubNav } from "@/components/navigation/AppSubNav";
import { HeaderActionLink } from "@/components/navigation/HeaderActionLink";
import { ResonateButton } from "@/components/ResonateButton";
import { MemberDetailSkeleton } from "@/components/skeletons/MemberDetailSkeleton";
import { getMemberProfileBandDataAction } from "@/lib/actions/profile";
import type { MemberProfileBandPayload } from "@/lib/actions/profile";
import type { ResonanceStatus } from "@/lib/resonance/status";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
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
  musicResonance?: import("@/types/music-profile").MusicPageView["sectionResonance"];
  resonanceStatus?: ResonanceStatus;
  showResonateButton?: boolean;
  mutualMembers?: import("@/types/band").MutualResonateMember[];
  memberBands?: import("@/types/band").Band[];
  bandActivities?: import("@/types/band").BandActivityFeedItem[];
  memberActivities?: import("@/types/activity").MemberActivityFeedItem[];
  lazyLoadBandData?: boolean;
  variant?: "page" | "sheet";
  onClose?: () => void;
  priorityPhoto?: boolean;
  headerSlot?: ReactNode;
};

export function MemberDetailFrame({
  member,
  isOwnProfile = false,
  resonanceReason,
  musicResonance,
  resonanceStatus,
  showResonateButton = false,
  mutualMembers = [],
  memberBands = [],
  bandActivities = [],
  memberActivities = [],
  lazyLoadBandData = false,
  variant = "page",
  onClose,
  priorityPhoto = false,
  headerSlot,
}: MemberDetailFrameProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lazyBandData, setLazyBandData] = useState<MemberProfileBandPayload | null>(null);
  const [bandDataLoading, setBandDataLoading] = useState(false);
  const isSheet = variant === "sheet";
  const sections = isOwnProfile ? getOwnProfileDetailSections() : DETAIL_SECTIONS;
  const lookingForIndex = sections.findIndex((section) => section.id === "lookingFor");
  const resolvedMutualMembers = lazyBandData?.mutualMembers ?? mutualMembers;
  const resolvedMemberBands = lazyBandData?.memberBands ?? memberBands;
  const resolvedBandActivities = lazyBandData?.bandActivities ?? bandActivities;
  const hasLazyBandPayload = lazyBandData !== null;
  const hasInitialBandData =
    mutualMembers.length > 0 || memberBands.length > 0 || bandActivities.length > 0;
  const shouldLazyLoadBandData = lazyLoadBandData && !hasInitialBandData;
  const containerClass = isSheet
    ? "flex h-full min-h-0 flex-col bg-background"
    : "flex flex-col bg-background";
  const containerStyle = isSheet ? undefined : { height: "100dvh" };
  const memberAccentColor = member.frequencyColor as FrequencyColorHex | undefined;
  const useMemberTheme = !isOwnProfile && Boolean(memberAccentColor);

  const scrollToIndex = useCallback((index: number) => {
    setActiveIndex(index);
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

  useEffect(() => {
    setLazyBandData(null);
    setBandDataLoading(false);
  }, [member.id]);

  useEffect(() => {
    if (!shouldLazyLoadBandData || hasLazyBandPayload || bandDataLoading) {
      return;
    }

    const shouldPrefetch =
      isSheet ||
      lazyLoadBandData ||
      (lookingForIndex >= 0 && activeIndex >= Math.max(0, lookingForIndex - 1));

    if (!shouldPrefetch) {
      return;
    }

    let cancelled = false;
    setBandDataLoading(true);

    void getMemberProfileBandDataAction(member.id)
      .then((result) => {
        if (cancelled) {
          return;
        }

        if (result.data) {
          setLazyBandData(result.data);
          return;
        }

        setLazyBandData({
          mutualMembers: [],
          memberBands: [],
          bandActivities: [],
        });
      })
      .finally(() => {
        setBandDataLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    activeIndex,
    bandDataLoading,
    hasLazyBandPayload,
    isSheet,
    lazyLoadBandData,
    lookingForIndex,
    member.id,
    shouldLazyLoadBandData,
  ]);

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
        return (
          <MusicSlide
            member={member}
            isOwnProfile={isOwnProfile}
            musicResonance={musicResonance}
          />
        );
      case "lookingFor":
        return (
          <LookingForSlide
            member={member}
            isOwnProfile={isOwnProfile}
            mutualMembers={resolvedMutualMembers}
            memberBands={resolvedMemberBands}
            bandActivities={resolvedBandActivities}
            bandDataLoading={bandDataLoading && !hasLazyBandPayload}
          />
        );
      case "activity":
        return <ActivitySlide activities={memberActivities} />;
      default:
        return null;
    }
  }

  const frameContent = (
    <>
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
                    {isOwnProfile ? "プロフィール" : member.name}
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="閉じる"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground/80"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="px-5 pb-1 pt-4">
                <AppTopBar
                  backHref="/"
                  backLabel="ホームに戻る"
                  trailing={
                    isOwnProfile ? (
                      <>
                        <HeaderActionLink href={`/member/${member.id}/edit`}>
                          編集
                        </HeaderActionLink>
                        <HeaderActionLink href="/discover" variant="primary">
                          Discover a Story
                        </HeaderActionLink>
                      </>
                    ) : undefined
                  }
                />
              </div>
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
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="h-full min-h-0 w-full flex-shrink-0 snap-start snap-always overflow-y-auto overscroll-y-contain"
          >
            {renderSlide(section.id)}
          </section>
        ))}
      </div>

      <div
        className={
          showResonateButton
            ? "shrink-0 px-5 pb-8 pt-4"
            : "shrink-0 px-5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        }
      >
        <div
          className={`flex justify-center gap-1.5 ${
            showResonateButton ? "mb-4" : "h-6 items-center"
          }`}
        >
          {sections.map((section, index) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={section.label}
              className={`h-1 rounded-full transition-all ${
                activeIndex === index
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-foreground/25"
              }`}
            />
          ))}
        </div>
        {showResonateButton ? (
          <ResonateButton memberId={member.id} initialStatus={resonanceStatus} />
        ) : null}
      </div>
    </>
  );

  if (useMemberTheme && !isSheet) {
    return (
      <MemberThemeScope color={memberAccentColor} className={containerClass} style={containerStyle}>
        {frameContent}
      </MemberThemeScope>
    );
  }

  return (
    <div className={containerClass} style={containerStyle}>
      {frameContent}
    </div>
  );
}

export function MemberDetailFrameLoading({ variant = "page" }: { variant?: "page" | "sheet" }) {
  return <MemberDetailSkeleton variant={variant === "sheet" ? "sheet" : "page"} />;
}
