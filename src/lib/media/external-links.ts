export type ExternalMediaKind = "youtube" | "image" | "link";

const URL_IN_TEXT =
  /https?:\/\/[^\s<>"')\]},]+/gi;

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parseYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id || null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2] ?? null;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/")[2] ?? null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function classifyMediaUrl(url: string): ExternalMediaKind {
  if (parseYouTubeVideoId(url)) {
    return "youtube";
  }

  if (/\.(jpg|jpeg|png|gif|webp|avif)(\?|$)/i.test(url)) {
    return "image";
  }

  return "link";
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function extractUrlsFromText(text: string): string[] {
  const matches = text.match(URL_IN_TEXT);
  if (!matches) {
    return [];
  }

  return [...new Set(matches.filter(isHttpUrl))];
}

export function splitTextWithUrls(text: string): Array<{ type: "text" | "url"; value: string }> {
  const parts: Array<{ type: "text" | "url"; value: string }> = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_IN_TEXT)) {
    const url = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, index) });
    }

    parts.push({ type: "url", value: url });
    lastIndex = index + url.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", value: text }];
}

export function formatLinkHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
