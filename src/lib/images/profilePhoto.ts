const UNSPLASH_HOST = "images.unsplash.com";

/** Normalize remote profile URLs for Next/Image (WebP + width via optimizer). */
export function getProfilePhotoSrc(url: string, width = 800): string {
  if (!url) {
    return url;
  }

  try {
    const parsed = new URL(url);

    if (parsed.hostname === UNSPLASH_HOST) {
      parsed.searchParams.set("w", String(width));
      parsed.searchParams.set("q", "80");
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "crop");
      return parsed.toString();
    }
  } catch {
    return url;
  }

  return url;
}

export function getProfilePhotoSizes(variant: "card" | "detail" | "thumb" | "ambient"): string {
  switch (variant) {
    case "thumb":
      return "64px";
    case "ambient":
      return "320px";
    case "detail":
      return "(max-width: 480px) 100vw, 390px";
    case "card":
    default:
      return "(max-width: 480px) 100vw, 390px";
  }
}
