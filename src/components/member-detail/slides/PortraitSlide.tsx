import Image from "next/image";
import Link from "next/link";
import { ProfilePhotoRing } from "@/components/frequency-color/ProfilePhotoRing";
import { ProfileItemsView } from "@/components/profile/ProfileItemsView";
import { ProfilePhotoPlaceholder } from "@/components/profile/ProfilePhotoPlaceholder";
import { ResonanceReasonBullets } from "@/components/ResonanceReasonBullets";
import {
  getProfilePhotoSizes,
  getProfilePhotoSrc,
} from "@/lib/images/profilePhoto";
import { hasProfilePhoto } from "@/lib/onboarding/status";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import type { ResonanceReason } from "@/lib/resonance/matching";
import type { Member } from "@/types/member";
import { ResonanceBadge } from "@/components/ui";

type PortraitSlideProps = {
  member: Member;
  resonanceReason?: ResonanceReason;
  isOwnProfile?: boolean;
  priorityPhoto?: boolean;
};

export function PortraitSlide({
  member,
  resonanceReason,
  isOwnProfile = false,
  priorityPhoto = false,
}: PortraitSlideProps) {
  const ringColor = member.frequencyColor as FrequencyColorHex | undefined;

  const resonanceSection =
    resonanceReason && !isOwnProfile ? (
      <div className="space-y-4 px-1">
        <div>
          <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-white/45">
            共鳴度
          </p>
          <ResonanceBadge rate={resonanceReason.score} size="lg" />
        </div>
        <ResonanceReasonBullets reason={resonanceReason} />
      </div>
    ) : null;

  return (
    <div className="flex h-full flex-col px-5 pb-8 pt-4">
      {isOwnProfile ? (
        <div className="mb-8 shrink-0 px-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--frequency-color)]">
                Profile
              </p>
              <h1 className="mt-1 text-[28px] font-light tracking-tight">プロフィール</h1>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                あなたの音楽活動をまとめて見る。
              </p>
            </div>
            <Link
              href={`/member/${member.id}/edit`}
              className="shrink-0 pt-1 text-[13px] font-medium tracking-wide text-[var(--frequency-color)]"
            >
              編集
            </Link>
          </div>
        </div>
      ) : null}

      <ProfilePhotoRing color={ringColor} className="mb-10 w-full shrink-0 rounded-[32px]">
        <div className="relative h-72 w-full overflow-hidden rounded-[32px] sm:h-80">
          {hasProfilePhoto(member.photo) ? (
            <Image
              src={getProfilePhotoSrc(member.photo, 720)}
              alt={member.name}
              fill
              className="object-cover"
              sizes={getProfilePhotoSizes("detail")}
              priority={priorityPhoto || isOwnProfile}
              loading={priorityPhoto || isOwnProfile ? undefined : "lazy"}
            />
          ) : (
            <ProfilePhotoPlaceholder className="rounded-[32px]" />
          )}
        </div>
      </ProfilePhotoRing>

      <ProfileItemsView
        member={member}
        isOwnProfile={isOwnProfile}
        resonanceSection={resonanceSection}
      />
    </div>
  );
}
