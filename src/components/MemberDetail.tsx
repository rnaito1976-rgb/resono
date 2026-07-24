"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Member, DETAIL_SECTIONS } from "@/types/member";
import { AppPageHeader } from "@/components/navigation/AppPageHeader";
import { AppSubNav } from "@/components/navigation/AppSubNav";
import { HeaderActionLink } from "@/components/navigation/HeaderActionLink";
import { ResonateButton } from "@/components/ResonateButton";
import { ProfilePhotoRing } from "@/components/frequency-color/ProfilePhotoRing";
import { ResonanceReasonBullets } from "@/components/ResonanceReasonBullets";
import { ChipGrid } from "@/components/onboarding/SelectableChip";
import { updateInstrumentsAction } from "@/lib/actions/member";
import {
  getProfilePhotoSizes,
  getProfilePhotoSrc,
} from "@/lib/images/profilePhoto";
import { PLAYING_PART_OPTIONS } from "@/lib/resonance/dialogue";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import type { ResonanceReason } from "@/lib/resonance/matching";
import type { MutualResonateMember } from "@/types/band";
import { ResonanceBadge, SectionBlock, TagList } from "@/components/ui";

type MemberDetailProps = {
  member: Member;
  isOwnProfile?: boolean;
  resonanceReason?: ResonanceReason;
  showResonateButton?: boolean;
  mutualMembers?: MutualResonateMember[];
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
            src={getProfilePhotoSrc(member.photo, 960)}
            alt={member.name}
            fill
            className="object-cover"
            sizes={getProfilePhotoSizes("detail")}
            priority={isOwnProfile}
            loading={isOwnProfile ? undefined : "lazy"}
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

function InstrumentsEditor({
  initialInstruments,
}: {
  initialInstruments: string[];
}) {
  const [selected, setSelected] = useState(initialInstruments);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleInstrument(instrument: string) {
    const next = selected.includes(instrument)
      ? selected.filter((item) => item !== instrument)
      : [...selected, instrument];

    setSelected(next);
    setError(null);

    startTransition(async () => {
      const result = await updateInstrumentsAction(next);
      if (result.error) {
        setError(result.error);
        setSelected(initialInstruments);
        return;
      }
      if (result.instruments) {
        setSelected(result.instruments);
      }
    });
  }

  return (
    <div className="space-y-3">
      <ChipGrid
        items={PLAYING_PART_OPTIONS}
        selected={selected}
        onToggle={toggleInstrument}
      />
      {isPending ? (
        <p className="text-[13px] text-white/45">保存中...</p>
      ) : null}
      {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
    </div>
  );
}

function MusicSlide({
  member,
  isOwnProfile = false,
}: {
  member: Member;
  isOwnProfile?: boolean;
}) {
  return (
    <div className="flex h-full flex-col space-y-8 px-6 pb-8 pt-4">
      <SectionBlock label="Instruments">
        {isOwnProfile ? (
          <InstrumentsEditor initialInstruments={member.music.instruments} />
        ) : (
          <TagList items={member.music.instruments} />
        )}
      </SectionBlock>
      <SectionBlock label="Genres">
        <TagList items={member.music.genres} variant="primary" />
      </SectionBlock>
      <SectionBlock label="Favorite">
        <TagList items={member.music.favoriteArtists} />
      </SectionBlock>
    </div>
  );
}

function LookingForSlide({
  member,
  isOwnProfile = false,
  mutualMembers = [],
}: {
  member: Member;
  isOwnProfile?: boolean;
  mutualMembers?: MutualResonateMember[];
}) {
  return (
    <div className="flex h-full flex-col space-y-8 px-6 pb-8 pt-4">
      {isOwnProfile ? (
        <SectionBlock label="共鳴した人">
          {mutualMembers.length > 0 ? (
            <div className="space-y-3">
              {mutualMembers.map(({ member: resonateMember, frequencyColor, conversationId }) => {
                const color = frequencyColor as FrequencyColorHex | undefined;

                return (
                  <div
                    key={resonateMember.id}
                    className="flex items-center gap-4 rounded-[24px] border border-white/8 bg-subtle px-4 py-4"
                  >
                    <Link href={`/member/${resonateMember.id}`} className="shrink-0">
                      <ProfilePhotoRing color={color} className="h-14 w-14 rounded-full">
                        <div className="relative h-14 w-14 overflow-hidden rounded-full">
                          <Image
                            src={getProfilePhotoSrc(resonateMember.photo, 112)}
                            alt={resonateMember.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                      </ProfilePhotoRing>
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/member/${resonateMember.id}`}
                        className="text-[17px] font-medium"
                      >
                        {resonateMember.name}
                      </Link>
                      <p className="mt-1 text-[13px] text-white/45">
                        {resonateMember.music.instruments.join(" · ") || "パート未設定"}
                      </p>
                    </div>
                    {conversationId ? (
                      <Link
                        href={`/messages/${conversationId}`}
                        className="shrink-0 rounded-full border border-white/10 px-3 py-2 text-[13px] text-primary"
                      >
                        メッセージ
                      </Link>
                    ) : null}
                  </div>
                );
              })}
              <Link
                href="/bands/new"
                className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-[15px] font-medium text-primary-foreground transition-quiet active:opacity-85"
              >
                Bandを作成
              </Link>
            </div>
          ) : (
            <div className="rounded-[28px] border border-white/8 bg-subtle px-6 py-8 text-center">
              <p className="text-[15px] leading-relaxed text-white/55">
                まだ共鳴した人がいません。
                <br />
                Homeから気になる人に共鳴してみましょう。
              </p>
              <Link href="/" className="mt-6 inline-flex text-[15px] text-primary">
                Homeへ戻る
              </Link>
            </div>
          )}
        </SectionBlock>
      ) : null}
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
  mutualMembers = [],
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
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl">
        {isOwnProfile ? (
          <AppPageHeader
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
            ) : index === 1 ? (
              <MusicSlide member={member} isOwnProfile={isOwnProfile} />
            ) : (
              <LookingForSlide
                member={member}
                isOwnProfile={isOwnProfile}
                mutualMembers={mutualMembers}
              />
            )}
          </section>
        ))}
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
