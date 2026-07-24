import { getProfilePhotoSrc } from "@/lib/images/profilePhoto";
import type { Member } from "@/types/member";

/** ホーム LCP 向け: 自カード優先、最大 640px */
export const HOME_LCP_IMAGE_WIDTH = 640;

export function getHomeLcpImageHref(
  currentMember?: Member,
  firstFeedMember?: Member
): string | undefined {
  const photo = currentMember?.photo ?? firstFeedMember?.photo;
  if (!photo) {
    return undefined;
  }

  return getProfilePhotoSrc(photo, HOME_LCP_IMAGE_WIDTH);
}
