import Image from "next/image";
import Link from "next/link";
import { ResonateButton } from "@/components/ResonateButton";
import { ProfilePhotoRing } from "@/components/frequency-color/ProfilePhotoRing";
import { ResonanceReasonBullets } from "@/components/ResonanceReasonBullets";
import { getPlayingParts } from "@/lib/resonance/dialogue";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import {
  getRecruitmentMatchLabelText,
  type RecommendationResult,
} from "@/lib/recommendation/scoring";
import type { ResonanceReason } from "@/lib/resonance/matching";
import { Member } from "@/types/member";
import { ResonanceBadge, TagList } from "@/components/ui";

type PersonCardProps = {
  member: Member;
  variant?: "default" | "ambient";
  recommendation?: RecommendationResult;
  resonanceReason?: ResonanceReason;
  isOwnCard?: boolean;
  priority?: boolean;
};

function getOpenParts(member: Member): string[] {
  const parts = member.lookingFor?.parts;
  return Array.isArray(parts) ? parts.filter(Boolean) : [];
}

export function PersonCard({
  member,
  variant = "default",
  recommendation,
  resonanceReason,
  isOwnCard = false,
  priority = false,
}: PersonCardProps) {
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

  return (
    <article className="overflow-hidden rounded-[28px] bg-subtle">
      <ProfilePhotoRing color={ringColor} className="rounded-[28px]">
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={member.photo}
            alt={member.name}
            fill
            className="object-cover"
            sizes="390px"
            priority={priority || (!isAmbient && member.id === "1")}
          />
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
                <div className="shrink-0 text-right">
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
            <div className="flex flex-wrap gap-2">
              {openParts.map((part) => {
                const isHighlighted = highlightedParts.has(part);

                return (
                  <span
                    key={part}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] ${
                      isHighlighted
                        ? "border border-primary/40 bg-[var(--frequency-color-soft)] text-white"
                        : "border border-white/10 bg-white/[0.04] text-white/90"
                    }`}
                  >
                    {part}
                    <span
                      className={`text-[10px] font-medium uppercase tracking-[0.12em] ${
                        isHighlighted ? "text-primary" : "text-primary/70"
                      }`}
                    >
                      Open
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}

        {!isOwnCard && resonanceReason ? (
          <ResonanceReasonBullets reason={resonanceReason} compact />
        ) : null}

        <TagList items={member.tags} />

        <blockquote className="border-l border-white/20 pl-4 text-[15px] leading-relaxed text-white/75">
          {member.aiComment}
        </blockquote>

        {!isAmbient ? (
          <div className="space-y-3">
            {!isOwnCard ? <ResonateButton memberId={member.id} /> : null}
            {isOwnCard ? (
              <Link
                href="/discover"
                className="flex h-12 w-full items-center justify-center rounded-full border border-white/10 text-[15px] font-medium tracking-wide text-white/80 transition-quiet active:opacity-70"
              >
                AIと少し話す
              </Link>
            ) : null}
            <Link
              href={`/member/${member.id}`}
              className="flex h-12 w-full items-center justify-center rounded-full border border-white/10 text-[15px] font-medium tracking-wide text-white transition-quiet active:opacity-70"
            >
              {isOwnCard ? "マイページ" : "もっと知る"}
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
