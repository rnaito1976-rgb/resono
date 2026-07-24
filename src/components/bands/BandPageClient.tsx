"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppSubNav } from "@/components/navigation/AppSubNav";
import { PageBackLink } from "@/components/navigation/PageBackLink";
import { createBandActivityAction } from "@/lib/actions/bands";
import {
  buildBandGradientStyle,
  formatBandGradientLabel,
} from "@/lib/bands/gradient";
import type { BandDetail, BandModuleId } from "@/types/band";
import { ProfilePhotoRing } from "@/components/frequency-color/ProfilePhotoRing";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { Button } from "@/components/ui/button";

const TABS: { id: BandModuleId; label: string }[] = [
  { id: "timeline", label: "Timeline" },
  { id: "activity", label: "Activity" },
  { id: "videos", label: "Videos" },
  { id: "members", label: "Members" },
];

const STATUS_LABELS = {
  forming: "結成中",
  active: "活動中",
  paused: "休止中",
  archived: "Archive",
} as const;

type BandPageClientProps = {
  detail: BandDetail;
};

export function BandPageClient({ detail }: BandPageClientProps) {
  const [tab, setTab] = useState<BandModuleId>("timeline");
  const gradientStyle = useMemo(
    () => buildBandGradientStyle(detail.gradientColors),
    [detail.gradientColors]
  );

  const videos = detail.activities.filter((item) => item.kind === "video");

  return (
    <div className="mx-auto min-h-dvh max-w-mobile bg-background pb-10">
      <div className="relative overflow-hidden px-5 pb-8 pt-6" style={gradientStyle}>
        <header className="mb-10 flex items-center">
          <PageBackLink href="/bands" label="Band一覧に戻る" />
        </header>

        <div className="space-y-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">
            {formatBandGradientLabel(detail.gradientColors)}
          </p>
          <h1 className="text-[34px] font-light tracking-tight text-white">
            {detail.band.name}
          </h1>
          <div className="flex flex-wrap gap-2 text-[13px] text-white/70">
            <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1 backdrop-blur-sm">
              {STATUS_LABELS[detail.band.activityStatus]}
            </span>
            <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1 backdrop-blur-sm">
              {new Date(detail.band.createdAt).toLocaleDateString("ja-JP")} 結成
            </span>
            <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1 backdrop-blur-sm">
              {detail.members.length} members
            </span>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-xl">
        <AppSubNav
          items={TABS}
          activeIndex={TABS.findIndex((item) => item.id === tab)}
          onSelect={(index) => setTab(TABS[index].id)}
        />
      </div>

      <div className="px-5 pt-8">
        {tab === "timeline" ? (
          <TimelineTab events={detail.timeline} />
        ) : null}
        {tab === "activity" ? (
          <ActivityTab bandId={detail.band.id} activities={detail.activities} />
        ) : null}
        {tab === "videos" ? <VideosTab videos={videos} /> : null}
        {tab === "members" ? <MembersTab members={detail.members} /> : null}
      </div>
    </div>
  );
}

function TimelineTab({
  events,
}: {
  events: BandDetail["timeline"];
}) {
  if (events.length === 0) {
    return (
      <p className="text-[15px] leading-relaxed text-white/45">
        まだタイムラインがありません。
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <article
          key={event.id}
          className="rounded-[24px] border border-white/8 bg-subtle px-5 py-5"
        >
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
            {new Date(event.occurredAt).toLocaleDateString("ja-JP")}
          </p>
          <h3 className="mt-2 text-[18px] font-medium tracking-tight">{event.title}</h3>
          {event.body ? (
            <p className="mt-2 text-[15px] leading-relaxed text-white/60">{event.body}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function ActivityTab({
  bandId,
  activities,
}: {
  bandId: string;
  activities: BandDetail["activities"];
}) {
  const [body, setBody] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [kind, setKind] = useState<"text" | "photo" | "video">("text");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await createBandActivityAction({
        bandId,
        kind,
        body: kind === "text" ? body : body || undefined,
        title: kind === "video" ? body || "Video" : undefined,
        mediaUrl: kind === "text" ? undefined : mediaUrl,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setBody("");
      setMediaUrl("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      <section className="space-y-5 rounded-[28px] border border-white/8 bg-subtle px-5 py-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Activity</p>
        <div className="flex gap-2">
          {(["text", "photo", "video"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setKind(value)}
              className={`rounded-full px-3 py-1.5 text-[13px] ${
                kind === value
                  ? "bg-[var(--frequency-color-soft)] text-primary"
                  : "border border-white/10 text-white/55"
              }`}
            >
              {value === "text" ? "テキスト" : value === "photo" ? "写真" : "動画"}
            </button>
          ))}
        </div>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={
            kind === "text"
              ? "初スタジオでした！"
              : kind === "photo"
                ? "キャプション（任意）"
                : "動画タイトル"
          }
          rows={4}
          className="w-full resize-none rounded-[22px] border border-white/8 bg-black/20 px-4 py-4 text-[16px] leading-relaxed text-white outline-none placeholder:text-white/30"
        />
        {kind !== "text" ? (
          <input
            value={mediaUrl}
            onChange={(event) => setMediaUrl(event.target.value)}
            placeholder="画像または動画URL"
            className="h-12 w-full rounded-full border border-white/10 bg-black/20 px-4 text-[14px] text-white outline-none placeholder:text-white/30"
          />
        ) : null}
        {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
        <Button disabled={isPending} onClick={handleSubmit} className="w-full">
          {isPending ? "投稿中..." : "記録を残す"}
        </Button>
      </section>

      <div className="space-y-8">
        {activities.map((activity) => (
          <article key={activity.id} className="space-y-3 border-l border-white/10 pl-5">
            <p className="text-[12px] uppercase tracking-[0.14em] text-white/35">
              {new Date(activity.createdAt).toLocaleDateString("ja-JP")}
            </p>
            {activity.body ? (
              <p className="text-[18px] leading-relaxed text-white/85">{activity.body}</p>
            ) : null}
            {activity.title ? (
              <p className="text-[15px] text-white/60">{activity.title}</p>
            ) : null}
            {activity.mediaUrl && activity.kind === "photo" ? (
              <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-[24px]">
                <Image
                  src={activity.mediaUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="390px"
                />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function VideosTab({ videos }: { videos: BandDetail["activities"] }) {
  if (videos.length === 0) {
    return (
      <p className="text-[15px] leading-relaxed text-white/45">
        まだ動画がありません。Activityから追加できます。
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {videos.map((video) => (
        <article key={video.id} className="overflow-hidden rounded-[20px] bg-subtle">
          <div className="relative aspect-square bg-black/30">
            {video.mediaUrl ? (
              <Image
                src={video.mediaUrl}
                alt={video.title ?? "Video"}
                fill
                className="object-cover"
                sizes="180px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white/30">Video</div>
            )}
          </div>
          <div className="space-y-1 px-3 py-3">
            <p className="text-[11px] text-white/40">
              {new Date(video.createdAt).toLocaleDateString("ja-JP")}
            </p>
            <p className="line-clamp-2 text-[14px] leading-snug text-white/85">
              {video.title ?? video.body ?? "Untitled"}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

function MembersTab({ members }: { members: BandDetail["members"] }) {
  return (
    <div className="space-y-4">
      {members.map((item) => {
        const color = item.frequencyColor as FrequencyColorHex | undefined;
        const parts = item.member.music.instruments.filter(Boolean);

        return (
          <article
            key={item.memberId}
            className="flex items-center gap-4 rounded-[24px] border border-white/8 bg-subtle px-4 py-4"
          >
            <ProfilePhotoRing color={color} className="h-16 w-16 rounded-full">
              <div className="relative h-16 w-16 overflow-hidden rounded-full">
                <Image
                  src={item.member.photo}
                  alt={item.member.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            </ProfilePhotoRing>
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-medium">{item.member.name}</p>
              <p className="mt-1 text-[13px] text-white/45">
                {parts.join(" · ") || "パート未設定"}
              </p>
              {item.resonatedAt ? (
                <p className="mt-1 text-[12px] text-white/35">
                  共鳴 {new Date(item.resonatedAt).toLocaleDateString("ja-JP")}
                </p>
              ) : null}
            </div>
            {item.resonanceScore != null ? (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                  共鳴率
                </p>
                <p className="text-[20px] font-light tabular-nums text-primary">
                  {item.resonanceScore}%
                </p>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
