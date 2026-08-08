import Image from "next/image";
import { ProfilePhotoRing } from "@/components/frequency-color/ProfilePhotoRing";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { withAlpha } from "@/lib/frequency-color/utils";
import { getProfilePhotoSrc, getProfilePhotoSizes } from "@/lib/images/profilePhoto";
import { hasProfilePhoto } from "@/lib/onboarding/status";
import type { Member } from "@/types/member";

const LIST_AVATAR_PX = 56;

function getMemberInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.slice(0, 1) : "?";
}

type MemberListAvatarProps = {
  member: Member;
  size?: number;
};

/** Compact list avatar — photo is secondary to music info on the card. */
export function MemberListAvatar({
  member,
  size = LIST_AVATAR_PX,
}: MemberListAvatarProps) {
  const color = member.frequencyColor as FrequencyColorHex | undefined;
  const showPhoto = hasProfilePhoto(member.photo);
  const initial = getMemberInitial(member.name);
  const initialSize = Math.max(12, Math.round(size * 0.32));

  return (
    <div className="shrink-0" style={{ width: size, height: size }}>
      <ProfilePhotoRing color={color} className="h-full w-full rounded-full">
        <div className="relative h-full w-full overflow-hidden rounded-full">
          {showPhoto ? (
            <Image
              src={getProfilePhotoSrc(member.photo, size * 2)}
              alt=""
              fill
              className="object-cover"
              sizes={getProfilePhotoSizes("thumb")}
              loading="lazy"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={
                color
                  ? { backgroundColor: withAlpha(color, 0.14) }
                  : { backgroundColor: "rgba(255,255,255,0.06)" }
              }
            >
              <span
                className="font-medium tracking-tight"
                style={{
                  fontSize: initialSize,
                  ...(color ? { color: withAlpha(color, 0.92) } : {}),
                }}
                aria-hidden
              >
                {initial}
              </span>
            </div>
          )}
        </div>
      </ProfilePhotoRing>
    </div>
  );
}

export const MEMBER_LIST_AVATAR_SIZE_PX = LIST_AVATAR_PX;
