import Image from "next/image";
import Link from "next/link";
import { BandGradientThumbnail } from "@/components/bands/BandGradientThumbnail";
import { ActivityMediaBlock } from "@/components/media/ActivityMediaBlock";
import { LinkifiedText } from "@/components/media/LinkifiedText";
import type { BandActivityFeedItem } from "@/types/band";

type BandActivityFeedProps = {
  activities: BandActivityFeedItem[];
  isOwnProfile?: boolean;
};

export function BandActivityFeed({
  activities,
  isOwnProfile = false,
}: BandActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <p className="text-[15px] leading-relaxed text-white/50">
        {isOwnProfile
          ? "まだBandのActivityはありません。Bandページから記録を残せます。"
          : "まだBandのActivityはありません。"}
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {activities.map((activity) => (
        <article key={activity.id} className="space-y-3 py-6 first:pt-0 last:pb-0">
          <div className="flex items-start gap-4">
            <Link href={`/bands/${activity.bandId}`} className="shrink-0">
              <BandGradientThumbnail colors={activity.gradientColors} size="sm" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/bands/${activity.bandId}`}
                    className="text-[15px] font-medium text-primary"
                  >
                    {activity.bandName}
                  </Link>
                  {activity.author ? (
                    <p className="mt-1 text-[13px] text-white/45">{activity.author.name}</p>
                  ) : null}
                </div>
                <p className="shrink-0 text-[12px] tabular-nums text-white/35">
                  {new Date(activity.createdAt).toLocaleDateString("ja-JP")}
                </p>
              </div>
              {activity.body ? (
                <LinkifiedText
                  text={activity.body}
                  className="mt-3 text-[16px] leading-relaxed text-white/85"
                />
              ) : null}
              {activity.title ? (
                <p className="mt-2 text-[15px] text-white/60">{activity.title}</p>
              ) : null}
              {activity.mediaUrl && activity.kind === "photo" ? (
                <ActivityMediaBlock url={activity.mediaUrl} kind="photo" sizes="320px" />
              ) : null}
              {activity.mediaUrl && activity.kind === "video" ? (
                <ActivityMediaBlock
                  url={activity.mediaUrl}
                  title={activity.title ?? activity.body ?? "Video"}
                  kind="video"
                  sizes="320px"
                />
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
