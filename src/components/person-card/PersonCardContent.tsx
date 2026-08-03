import Image from "next/image";
import { ProfilePhotoRing } from "@/components/frequency-color/ProfilePhotoRing";
import { ProfilePhotoPlaceholder } from "@/components/profile/ProfilePhotoPlaceholder";
import { ResonanceReasonBullets } from "@/components/ResonanceReasonBullets";
import {
  getProfilePhotoSizes,
  getProfilePhotoSrc,
} from "@/lib/images/profilePhoto";
import { hasProfilePhoto } from "@/lib/onboarding/status";
import { HOME_LCP_IMAGE_WIDTH } from "@/lib/images/lcp";
import { getPlayingParts } from "@/lib/resonance/dialogue";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import {
  getRecruitmentMatchLabelText,
} from "@/lib/recommendation/scoring";
import { ResonanceBadge, TagList } from "@/components/ui";
import { RecruitmentPartsList } from "@/components/recruitment/RecruitmentPartsList";
import type { PersonCardData } from "@/components/person-card/types";
import type { ReactNode } from "react";

function getOpenParts(member: PersonCardData["member"]): string[] {
  const parts = member.lookingFor?.parts;
  return Array.isArray(parts) ? parts.filter(Boolean) : [];
}

type PersonCardContentProps = PersonCardData & {
  actions?: ReactNode;
};

export function PersonCardContent({
  member,
  variant = "default",
  recommendation,
  resonanceReason,
  isOwnCard = false,
  priority = false,
  actions,
  initialAppliedParts = [],
  initialRecruitmentApplicants = [],
}: PersonCardContentProps) {
  const isAmbient = variant === "ambient";
  const score = resonanceReason?.score;
  const openParts = getOpenParts(member);
  const playingParts = getPlayingParts(member);
  const ringColor = isOwnCard
    ? undefined
    : (member.frequencyColor as FrequencyColorHex | undefined);
  const highlightedParts = new Set(
    recommendation?.recruitmentLabel === "sought-by-target"
      ? (recommendation.highlightedParts ?? [])
      : []
  );
  const recruitmentLabel = recommendation?.recruitmentLabel
    ? getRecruitmentMatchLabelText(recommendation.recruitmentLabel)
    : undefined;
  const shouldPrioritize = priority && !isAmbient;
  const photoSrc = isOwnCard
    ? getProfilePhotoSrc(member.photo, HOME_LCP_IMAGE_WIDTH)
    : getProfilePhotoSrc(
        member.photo,
        shouldPrioritize ? HOME_LCP_IMAGE_WIDTH : isAmbient ? 320 : 400
      );

  return (
    <article className="overflow-hidden rounded-[28px] bg-subtle">
      <ProfilePhotoRing color={ringColor} className="rounded-[28px]">
        <div className="relative aspect-square w-full">
          {hasProfilePhoto(member.photo) ? (
            <Image
              key={photoSrc}
              src={photoSrc}
              alt={member.name}
              fill
              className="object-cover"
              sizes={getProfilePhotoSizes(isAmbient ? "ambient" : "card")}
              priority={shouldPrioritize}
              fetchPriority={shouldPrioritize ? "high" : undefined}
              loading={shouldPrioritize ? undefined : "lazy"}
            />
          ) : (
            <ProfilePhotoPlaceholder />
          )}
          <div
            className={`absolute inset-0 bg-gradient-to-t via-black/20 to-transparent ${
              isOwnCard ? "from-black/85" : "from-black/80"
            }`}
          />
          {recruitmentLabel ? (
            <div className="absolute left-5 top-5 max-w-[70%]">
              <span className="inline-flex rounded-full border border-primary/30 bg-black/45 px-3 py-1.5 text-[12px] font-medium leading-snug text-primary backdrop-blur-md">
                {recruitmentLabel}
              </span>
            </div>
          ) : null}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                {playingParts.length > 0 ? (
                  <p className="mb-1.5 text-[13px] font-medium tracking-wide text-white/75">
                    {playingParts.join(" · ")}
                  </p>
                ) : null}
                <h2 className="text-[28px] font-light tracking-tight">{member.name}</h2>
              </div>
              {!isOwnCard && score != null ? (
                <div className="shrink-0 text-right text-white">
                  <p className="mb-0.5 text-[10px] uppercase tracking-[0.18em] text-white/50">
                    共鳴度
                  </p>
                  <ResonanceBadge rate={score} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </ProfilePhotoRing>

      <div className="space-y-6 px-6 pb-8 pt-6">
        {openParts.length > 0 ? (
          <div className="space-y-2.5">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
              募集パート
            </p>
            <RecruitmentPartsList
              targetMemberId={member.id}
              parts={openParts}
              isOwnProfile={isOwnCard}
              highlightedParts={[...highlightedParts]}
              variant="chips"
              initialAppliedParts={initialAppliedParts}
              initialApplicants={initialRecruitmentApplicants}
            />
          </div>
        ) : null}

        {!isOwnCard && resonanceReason ? (
          <ResonanceReasonBullets reason={resonanceReason} compact />
        ) : null}

        <TagList items={member.tags} />

        <blockquote className="border-l border-border pl-4 text-[15px] leading-relaxed text-white/75">
          {member.aiComment}
        </blockquote>

        {!isAmbient && actions ? (
          <div className="space-y-3">{actions}</div>
        ) : null}
      </div>
    </article>
  );
}
