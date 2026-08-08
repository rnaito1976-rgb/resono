import Image from "next/image";
import {
  classifyMediaUrl,
  formatLinkHostname,
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  parseYouTubeVideoId,
} from "@/lib/media/external-links";

type ActivityMediaBlockProps = {
  url: string;
  title?: string;
  kind?: "photo" | "video";
  sizes?: string;
  className?: string;
};

export function ActivityMediaBlock({
  url,
  title,
  kind,
  sizes = "320px",
  className = "mt-4",
}: ActivityMediaBlockProps) {
  const mediaKind = kind === "photo" ? "image" : classifyMediaUrl(url);

  if (mediaKind === "youtube") {
    const videoId = parseYouTubeVideoId(url);
    if (!videoId) {
      return <ExternalLinkCard url={url} className={className} />;
    }

    return (
      <div className={`relative aspect-video overflow-hidden rounded-[20px] bg-black/30 ${className}`}>
        <iframe
          src={getYouTubeEmbedUrl(videoId)}
          title={title ?? "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  if (mediaKind === "image") {
    return (
      <div className={`relative aspect-[4/3] overflow-hidden rounded-[20px] ${className}`}>
        <Image
          src={url}
          alt={title ?? ""}
          fill
          className="object-cover"
          sizes={sizes}
          loading="lazy"
        />
      </div>
    );
  }

  if (kind === "video") {
    const youtubeId = parseYouTubeVideoId(url);
    if (youtubeId) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`relative block aspect-video overflow-hidden rounded-[20px] bg-black/30 ${className}`}
        >
          <Image
            src={getYouTubeThumbnailUrl(youtubeId)}
            alt={title ?? "Video"}
            fill
            className="object-cover opacity-90"
            sizes={sizes}
            loading="lazy"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-[13px] uppercase tracking-[0.16em] text-white/85">
            動画を見る
          </span>
        </a>
      );
    }
  }

  return <ExternalLinkCard url={url} className={className} />;
}

function ExternalLinkCard({ url, className = "mt-4" }: { url: string; className?: string }) {
  const hostname = formatLinkHostname(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-[20px] border border-border bg-black/20 px-4 py-4 transition-colors hover:bg-black/30 ${className}`}
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-primary">Link</p>
      <p className="mt-2 text-[16px] font-medium text-white/90">{hostname}</p>
      <p className="mt-1 line-clamp-2 break-all text-[13px] text-white/45">{url}</p>
    </a>
  );
}
