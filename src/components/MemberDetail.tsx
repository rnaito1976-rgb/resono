"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Member, DETAIL_SECTIONS } from "@/types/member";
import { ResonateButton } from "@/components/ResonateButton";
import { ProfilePhotoRing } from "@/components/frequency-color/ProfilePhotoRing";
import { ResonanceReasonBullets } from "@/components/ResonanceReasonBullets";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import type { ResonanceReason } from "@/lib/resonance/matching";
import { ResonanceBadge, SectionBlock, TagList } from "@/components/ui";

type MemberDetailProps = {
  member: Member;
  isOwnProfile?: boolean;
  resonanceReason?: ResonanceReason;
  showResonateButton?: boolean;
};

function PortraitSlide({
  member,
  resonanceReason,
  isOwnProfile = false,
}: {
  member: Member;
  resonanceReason?: ResonanceReason;
  isOwnProfile?: boolean;
}) {
  const playingParts = member.music.instruments.filter(Boolean);
  const ringColor = member.frequencyColor as FrequencyColorHex | undefined;

  return (
    <div className="flex h-full flex-col px-6 pb-8 pt-4">
      <ProfilePhotoRing color={ringColor} className="mb-8 rounded-3xl">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl">
          <Image
            src={member.photo}
            alt={member.name}
            fill
            className="object-cover"
            sizes="390px"
          />
        </div>
      </ProfilePhotoRing>
      <div className="space-y-8">
        <div>
          {playingParts.length > 0 ? (
            <p className="mb-2 text-[13px] font-medium tracking-wide text-white/70">
              {playingParts.join(" · ")}
            </p>
          ) : null}
          <h2 className="mb-2 text-3xl font-light tracking-tight">{member.name}</h2>
          {resonanceReason && !isOwnProfile ? (
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-white/45">
                  共鳴度
                </p>
                <ResonanceBadge rate={resonanceReason.score} size="lg" />
              </div>
              <ResonanceReasonBullets reason={resonanceReason} />
            </div>
          ) : null}
        </div>
        <SectionBlock label="About">
          <p>{member.portrait.bio}</p>
        </SectionBlock>
        {member.portrait.location ? (
          <SectionBlock label="Location">
            <p>{member.portrait.location}</p>
          </SectionBlock>
        ) : null}
        <SectionBlock label="Influences">
          <TagList items={member.portrait.influences.map((item) => item.split(":")[1] ?? item)} />
        </SectionBlock>
      </div>
    </div>
  );
}

function MusicSlide({ member }: { member: Member }) {
  return (
    <div className="flex h-full flex-col space-y-8 px-6 pb-8 pt-4">
      <SectionBlock label="Genres">
        <TagList items={member.music.genres} variant="primary" />
      </SectionBlock>
      <SectionBlock label="Favorite Artists">
        <TagList items={member.music.favoriteArtists} />
      </SectionBlock>
      <SectionBlock label="Instruments">
        <TagList items={member.music.instruments} />
      </SectionBlock>
    </div>
  );
}

function LookingForSlide({ member }: { member: Member }) {
  return (
    <div className="flex h-full flex-col space-y-8 px-6 pb-8 pt-4">
      <SectionBlock label="募集パート">
        <div className="space-y-3">
          {member.lookingFor.parts.length > 0 ? (
            member.lookingFor.parts.map((part) => (
              <div
                key={part}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
              >
                <span className="text-base font-medium">{part}</span>
                <span className="text-xs uppercase tracking-[0.15em] text-primary">
                  Open
                </span>
              </div>
            ))
          ) : (
            <p className="text-[15px] leading-relaxed text-white/50">
              まだ募集パートは設定されていません。
            </p>
          )}
        </div>
      </SectionBlock>
      {member.lookingFor.bandVision ? (
        <SectionBlock label="Band Vision">
          <p>{member.lookingFor.bandVision}</p>
        </SectionBlock>
      ) : null}
      {member.lookingFor.commitment ? (
        <SectionBlock label="Activity">
          <p>{member.lookingFor.commitment}</p>
        </SectionBlock>
      ) : null}
    </div>
  );
}

const SLIDE_COMPONENTS = [PortraitSlide, MusicSlide, LookingForSlide] as const;

export function MemberDetail({
  member,
  isOwnProfile = false,
  resonanceReason,
  showResonateButton = false,
}: MemberDetailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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
    <div className="flex h-dvh flex-col bg-background">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-5 py-4">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors active:bg-white/10"
            aria-label="戻る"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-sm font-medium tracking-[0.25em] text-white/90">
            {isOwnProfile ? "マイページ" : member.name}
          </h1>
          {isOwnProfile ? (
            <div className="flex items-center gap-1">
              <Link
                href={`/member/${member.id}/edit`}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors active:bg-white/10"
                aria-label="プロフィールを編集"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 18.5 3 19l.5-4L16.5 3.5z" />
                </svg>
              </Link>
              <Link
                href="/discover"
                className="flex h-10 items-center justify-center rounded-full px-3 text-[13px] text-primary transition-colors active:bg-white/10"
              >
                AIと話す
              </Link>
            </div>
          ) : (
            <div className="h-10 w-10" />
          )}
        </div>

        <nav className="border-b border-white/5">
          <div className="flex overflow-x-auto scrollbar-hide">
            {DETAIL_SECTIONS.map((section, index) => (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollToIndex(index)}
                className={`shrink-0 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors ${
                  activeIndex === index
                    ? "border-b-2 border-white text-white"
                    : "text-muted"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden scrollbar-hide"
      >
        {SLIDE_COMPONENTS.map((SlideComponent, index) => (
          <section
            key={DETAIL_SECTIONS[index].id}
            className="h-full min-h-0 w-full flex-shrink-0 snap-start snap-always overflow-y-auto overscroll-y-contain"
          >
            {index === 0 ? (
              <PortraitSlide
                member={member}
                resonanceReason={resonanceReason}
                isOwnProfile={isOwnProfile}
              />
            ) : (
              <SlideComponent member={member} />
            )}
          </section>
        ))}
      </div>

      <div className="border-t border-white/5 bg-background px-5 pb-8 pt-4">
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
        {showResonateButton ? <ResonateButton memberId={member.id} /> : null}
        {isOwnProfile ? (
          <div className="space-y-3">
            <Link
              href="/discover"
              className="flex h-12 w-full items-center justify-center rounded-full border border-white/10 text-[15px] font-medium tracking-wide text-white/80 transition-quiet active:opacity-70"
            >
              AIと少し話す
            </Link>
            <Link
              href={`/member/${member.id}/edit`}
              className="flex h-12 w-full items-center justify-center rounded-full border border-white/10 text-[15px] font-medium tracking-wide text-white transition-quiet active:opacity-70"
            >
              プロフィールを編集
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
