import Image from "next/image";
import Link from "next/link";
import { ProfilePhotoRing } from "@/components/frequency-color/ProfilePhotoRing";
import { getProfilePhotoSrc } from "@/lib/images/profilePhoto";
import type { MemberActivityFeedItem, MemberActivityKind } from "@/types/activity";

const KIND_LABELS: Record<MemberActivityKind, string> = {
  mutual_resonance: "共鳴",
  resonance_sent: "共鳴を送信",
  resonance_received: "共鳴を受信",
  band_formed: "Band結成",
  member_joined: "Band参加",
  band_post: "投稿",
  timeline: "マイルストーン",
  profile_milestone: "Activity",
};

type MemberActivityFeedProps = {
  activities: MemberActivityFeedItem[];
};

export function MemberActivityFeed({ activities }: MemberActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-[28px] border border-border bg-subtle px-6 py-10 text-center">
        <p className="text-[15px] leading-relaxed text-white/55">
          まだActivityはありません。
          <br />
          共鳴やBandの活動がここに記録されます。
        </p>
        <Link href="/" className="mt-6 inline-flex text-[15px] text-primary">
          Homeへ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}

function ActivityCard({ activity }: { activity: MemberActivityFeedItem }) {
  const label = KIND_LABELS[activity.kind];
  const date = new Date(activity.occurredAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article className="rounded-[24px] border border-border bg-subtle px-5 py-5">
      <div className="flex items-start gap-4">
        {activity.partnerMember ? (
          <Link href={`/member/${activity.partnerMember.id}`} className="shrink-0">
            <ProfilePhotoRing className="h-12 w-12 rounded-full">
              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                <Image
                  src={getProfilePhotoSrc(activity.partnerMember.photo, 96)}
                  alt={activity.partnerMember.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                  loading="lazy"
                />
              </div>
            </ProfilePhotoRing>
          </Link>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
              {label}
            </span>
            <time className="shrink-0 text-[12px] tabular-nums text-white/35">{date}</time>
          </div>

          <h3 className="mt-2 text-[17px] font-medium tracking-tight">{activity.title}</h3>

          {activity.body ? (
            <p className="mt-1.5 text-[15px] leading-relaxed text-white/60">{activity.body}</p>
          ) : null}

          {activity.bandId ? (
            <Link
              href={`/bands/${activity.bandId}`}
              className="mt-3 inline-flex text-[14px] text-primary"
            >
              {activity.bandName ?? "Band"} を見る
            </Link>
          ) : null}

          {activity.partnerMember &&
          (activity.kind === "mutual_resonance" ||
            activity.kind === "resonance_sent" ||
            activity.kind === "resonance_received") ? (
            <Link
              href={`/member/${activity.partnerMember.id}`}
              className="mt-3 inline-flex text-[14px] text-primary"
            >
              プロフィールを見る
            </Link>
          ) : null}

          {activity.mediaUrl && activity.activityKind === "photo" ? (
            <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-[20px]">
              <Image
                src={activity.mediaUrl}
                alt=""
                fill
                className="object-cover"
                sizes="320px"
                loading="lazy"
              />
            </div>
          ) : null}

          {activity.mediaUrl && activity.activityKind === "video" ? (
            <div className="relative mt-4 aspect-square overflow-hidden rounded-[20px] bg-black/30">
              <Image
                src={activity.mediaUrl}
                alt={activity.title}
                fill
                className="object-cover"
                sizes="320px"
                loading="lazy"
              />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
