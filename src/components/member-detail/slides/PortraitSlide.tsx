import Image from "next/image";
import { ProfilePhotoRing } from "@/components/frequency-color/ProfilePhotoRing";
import { ResonanceReasonBullets } from "@/components/ResonanceReasonBullets";
import {
  getProfilePhotoSizes,
  getProfilePhotoSrc,
} from "@/lib/images/profilePhoto";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import type { ResonanceReason } from "@/lib/resonance/matching";
import type { Member } from "@/types/member";
import { ResonanceBadge, SectionBlock, TagList } from "@/components/ui";

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
  const playingParts = member.music.instruments.filter(Boolean);
  const ringColor = member.frequencyColor as FrequencyColorHex | undefined;

  return (
    <div className="flex h-full flex-col px-6 pb-8 pt-4">
      <ProfilePhotoRing color={ringColor} className="mb-8 w-full shrink-0 rounded-3xl">
        <div className="relative h-72 w-full overflow-hidden rounded-3xl sm:h-80">
          <Image
            src={getProfilePhotoSrc(member.photo, 720)}
            alt={member.name}
            fill
            className="object-cover"
            sizes={getProfilePhotoSizes("detail")}
            priority={priorityPhoto || isOwnProfile}
            loading={priorityPhoto || isOwnProfile ? undefined : "lazy"}
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
