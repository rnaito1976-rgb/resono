"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Member, DETAIL_SECTIONS } from "@/types/member";
import { ResonanceBadge, SectionBlock, TagList } from "@/components/ui";

type MemberDetailProps = {
  member: Member;
};

function PortraitSlide({ member }: { member: Member }) {
  return (
    <div className="flex h-full flex-col px-6 pb-8 pt-4">
      <div className="relative mb-8 aspect-[3/4] w-full overflow-hidden rounded-3xl">
        <Image
          src={member.photo}
          alt={member.name}
          fill
          className="object-cover"
          sizes="390px"
        />
      </div>
      <div className="space-y-8">
        <div>
          <h2 className="mb-2 text-3xl font-light tracking-tight">{member.name}</h2>
          <ResonanceBadge rate={member.resonanceRate} size="lg" />
        </div>
        <SectionBlock label="About">
          <p>{member.portrait.bio}</p>
        </SectionBlock>
        <SectionBlock label="Location">
          <p>
            {member.portrait.location} · {member.portrait.age}歳
          </p>
        </SectionBlock>
        <SectionBlock label="Influences">
          <TagList items={member.portrait.influences} />
        </SectionBlock>
      </div>
    </div>
  );
}

function MusicSlide({ member }: { member: Member }) {
  return (
    <div className="flex h-full flex-col space-y-8 px-6 pb-8 pt-4">
      <SectionBlock label="Genres">
        <TagList items={member.music.genres} variant="accent" />
      </SectionBlock>
      <SectionBlock label="Favorite Artists">
        <TagList items={member.music.favoriteArtists} />
      </SectionBlock>
      <SectionBlock label="Instruments">
        <TagList items={member.music.instruments} />
      </SectionBlock>
      <SectionBlock label="Listening Mood">
        <p className="text-lg font-light italic text-white/80">
          「{member.music.listeningMood}」
        </p>
      </SectionBlock>
    </div>
  );
}

function FashionSlide({ member }: { member: Member }) {
  return (
    <div className="flex h-full flex-col space-y-8 px-6 pb-8 pt-4">
      <SectionBlock label="Style">
        <p className="text-xl font-light">{member.fashion.style}</p>
      </SectionBlock>
      <SectionBlock label="Colors">
        <TagList items={member.fashion.colors} />
      </SectionBlock>
      <SectionBlock label="Brands">
        <TagList items={member.fashion.brands} />
      </SectionBlock>
      <SectionBlock label="Description">
        <p>{member.fashion.description}</p>
      </SectionBlock>
    </div>
  );
}

function MoodSlide({ member }: { member: Member }) {
  return (
    <div className="flex h-full flex-col space-y-8 px-6 pb-8 pt-4">
      <SectionBlock label="Keywords">
        <TagList items={member.mood.keywords} variant="accent" />
      </SectionBlock>
      <SectionBlock label="Atmosphere">
        <p className="text-lg font-light italic text-white/80">
          {member.mood.atmosphere}
        </p>
      </SectionBlock>
      <SectionBlock label="Creative Time">
        <p className="text-xl font-light tabular-nums">{member.mood.creativeTime}</p>
      </SectionBlock>
      <SectionBlock label="Description">
        <p>{member.mood.description}</p>
      </SectionBlock>
    </div>
  );
}

function LookingForSlide({ member }: { member: Member }) {
  return (
    <div className="flex h-full flex-col space-y-8 px-6 pb-8 pt-4">
      <SectionBlock label="募集パート">
        <div className="space-y-3">
          {member.lookingFor.parts.map((part) => (
            <div
              key={part}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
            >
              <span className="text-base font-medium">{part}</span>
              <span className="text-xs uppercase tracking-[0.15em] text-accent">
                Open
              </span>
            </div>
          ))}
        </div>
      </SectionBlock>
      <SectionBlock label="Band Vision">
        <p>{member.lookingFor.bandVision}</p>
      </SectionBlock>
      <SectionBlock label="Commitment">
        <p>{member.lookingFor.commitment}</p>
      </SectionBlock>
    </div>
  );
}

const SLIDE_COMPONENTS = [
  PortraitSlide,
  MusicSlide,
  FashionSlide,
  MoodSlide,
  LookingForSlide,
] as const;

export function MemberDetail({ member }: MemberDetailProps) {
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
            {member.name}
          </h1>
          <div className="w-10" />
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
            <SlideComponent member={member} />
          </section>
        ))}
      </div>

      <div className="flex justify-center gap-1.5 px-6 py-5">
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
    </div>
  );
}
