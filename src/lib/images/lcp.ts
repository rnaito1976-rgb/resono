import { getProfilePhotoSrc } from "@/lib/images/profilePhoto";
import type { Member } from "@/types/member";

/** ホーム LCP 向け: 自カード優先、最大 640px */
export const HOME_LCP_IMAGE_WIDTH = 640;

const DEFAULT_IMAGE_QUALITY = 75;

/** next/image が実際にリクエストする URL（preload 用） */
export function getNextImagePreloadHref(
  photoUrl: string,
  width: number,
  quality = DEFAULT_IMAGE_QUALITY
): string | undefined {
  if (!photoUrl) {
    return undefined;
  }

  const src = getProfilePhotoSrc(photoUrl, width);
  const params = new URLSearchParams({
    url: src,
    w: String(width),
    q: String(quality),
  });

  return `/_next/image?${params.toString()}`;
}

export function getHomeLcpImageHref(
  currentMember?: Member,
  firstFeedMember?: Member
): string | undefined {
  const photo = currentMember?.photo ?? firstFeedMember?.photo;
  if (!photo) {
    return undefined;
  }

  return getNextImagePreloadHref(photo, HOME_LCP_IMAGE_WIDTH);
}
