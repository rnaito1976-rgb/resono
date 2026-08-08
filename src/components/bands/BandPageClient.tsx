"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { AppSubNav } from "@/components/navigation/AppSubNav";
import { AppTopBar } from "@/components/navigation/AppTopBar";
import {
  addBandCoverSongAction,
  addBandCoverSongsAction,
  createBandActivityAction,
  markBandAsSeenAction,
  removeBandCoverSongAction,
} from "@/lib/actions/bands";
import { dispatchBandsChange } from "@/lib/bands/events";
import {
  buildBandGradientStyle,
  formatBandGradientLabel,
} from "@/lib/bands/gradient";
import { formatArtistSongLine } from "@/lib/form";
import type { CoverSongEntry } from "@/lib/music/band-cover-songs";
import type { BandCoverSong, BandDetail, BandModuleId } from "@/types/band";
import { CoverSongCard } from "@/components/member-detail/music/CoverSongCard";
import { AddBandMembersPanel } from "@/components/bands/AddBandMembersPanel";
import { ProfilePhotoRing } from "@/components/frequency-color/ProfilePhotoRing";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { ActivityMediaBlock } from "@/components/media/ActivityMediaBlock";
import { LinkifiedText } from "@/components/media/LinkifiedText";
import { classifyMediaUrl, isHttpUrl, parseYouTubeVideoId } from "@/lib/media/external-links";
import { Button } from "@/components/ui/button";

const TABS: { id: BandModuleId; label: string }[] = [
  { id: "timeline", label: "Timeline" },
  { id: "setlist", label: "Set List" },
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
  profileCoverSongs?: CoverSongEntry[];
};

export function BandPageClient({
  detail,
  profileCoverSongs = [],
}: BandPageClientProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const gradientStyle = useMemo(
    () => buildBandGradientStyle(detail.gradientColors),
    [detail.gradientColors]
  );

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      left: index * container.clientWidth,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    markBandAsSeenAction(detail.band.id).then(() => {
      dispatchBandsChange();
    });
  }, [detail.band.id]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      const index = Math.round(container.scrollLeft / container.clientWidth);
      setActiveIndex(index);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const videos = detail.activities.filter((item) => item.kind === "video");

  function shouldRenderTab(index: number) {
    return Math.abs(index - activeIndex) <= 1;
  }

  return (
    <div className="mx-auto flex max-w-mobile flex-col bg-background" style={{ height: "100dvh" }}>
      <header className="sticky top-0 z-10 shrink-0 bg-background/90 backdrop-blur-xl">
        <div className="px-5 pt-6">
          <AppTopBar backHref="/bands" backLabel="Band一覧に戻る" />
        </div>
        <AppSubNav items={TABS} activeIndex={activeIndex} onSelect={scrollToIndex} />
      </header>

      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden scrollbar-hide"
      >
        <section className="h-full min-h-0 w-full flex-shrink-0 snap-start snap-always overflow-y-auto overscroll-y-contain pb-10">
          {shouldRenderTab(0) ? (
            <>
              <BandHero detail={detail} gradientStyle={gradientStyle} />
              <div className="px-5 pt-8">
                <TimelineTab events={detail.timeline} />
              </div>
            </>
          ) : null}
        </section>
        <section className="h-full min-h-0 w-full flex-shrink-0 snap-start snap-always overflow-y-auto overscroll-y-contain px-5 pb-10 pt-8">
          {shouldRenderTab(1) ? (
            <SetListTab
              bandId={detail.band.id}
              coverSongs={detail.coverSongs}
              profileCoverSongs={profileCoverSongs}
            />
          ) : null}
        </section>
        <section className="h-full min-h-0 w-full flex-shrink-0 snap-start snap-always overflow-y-auto overscroll-y-contain px-5 pb-8 pt-8">
          {shouldRenderTab(2) ? (
            <ActivityTab bandId={detail.band.id} activities={detail.activities} />
          ) : null}
        </section>
        <section className="h-full min-h-0 w-full flex-shrink-0 snap-start snap-always overflow-y-auto overscroll-y-contain px-5 pb-10 pt-8">
          {shouldRenderTab(3) ? <VideosTab videos={videos} /> : null}
        </section>
        <section className="h-full min-h-0 w-full flex-shrink-0 snap-start snap-always overflow-y-auto overscroll-y-contain px-5 pb-10 pt-8">
          {shouldRenderTab(4) ? (
            <MembersTab
              bandId={detail.band.id}
              bandName={detail.band.name}
              members={detail.members}
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}

function BandHero({
  detail,
  gradientStyle,
}: {
  detail: BandDetail;
  gradientStyle: ReturnType<typeof buildBandGradientStyle>;
}) {
  return (
    <div className="relative overflow-hidden px-5 pb-6 pt-2" style={gradientStyle}>
      <div className="space-y-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">
          {formatBandGradientLabel(detail.gradientColors)}
        </p>
        <h1 className="text-[34px] font-light tracking-tight text-white">{detail.band.name}</h1>
        <div className="flex flex-wrap gap-2 text-[13px] text-white/70">
          <span className="rounded-full border border-border bg-black/20 px-3 py-1 backdrop-blur-sm">
            {STATUS_LABELS[detail.band.activityStatus]}
          </span>
          <span className="rounded-full border border-border bg-black/20 px-3 py-1 backdrop-blur-sm">
            {new Date(detail.band.createdAt).toLocaleDateString("ja-JP")} 結成
          </span>
          <span className="rounded-full border border-border bg-black/20 px-3 py-1 backdrop-blur-sm">
            {detail.members.length} members
          </span>
        </div>
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
          className="rounded-[24px] border border-border bg-subtle px-5 py-5"
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

function SetListTab({
  bandId,
  coverSongs,
  profileCoverSongs,
}: {
  bandId: string;
  coverSongs: BandCoverSong[];
  profileCoverSongs: CoverSongEntry[];
}) {
  const [raw, setRaw] = useState("");
  const [selectedProfileSongs, setSelectedProfileSongs] = useState<CoverSongEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggleProfileSong(song: CoverSongEntry) {
    setSelectedProfileSongs((current) => {
      const key = `${song.artist}::${song.title}`;
      const exists = current.some((item) => `${item.artist}::${item.title}` === key);
      if (exists) {
        return current.filter((item) => `${item.artist}::${item.title}` !== key);
      }
      return [...current, song];
    });
  }

  function handleAddSong() {
    setError(null);
    startTransition(async () => {
      const result = await addBandCoverSongAction({ bandId, raw });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setRaw("");
      dispatchBandsChange();
      router.refresh();
    });
  }

  function handleAddFromProfile() {
    setError(null);
    startTransition(async () => {
      const result = await addBandCoverSongsAction({
        bandId,
        songs: selectedProfileSongs,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSelectedProfileSongs([]);
      dispatchBandsChange();
      router.refresh();
    });
  }

  function handleRemove(songId: string) {
    setError(null);
    startTransition(async () => {
      const result = await removeBandCoverSongAction({ bandId, songId });
      if (result?.error) {
        setError(result.error);
        return;
      }
      dispatchBandsChange();
      router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      <section className="space-y-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Set List</p>
        <p className="text-[15px] leading-relaxed text-white/50">
          このBandでコピーした曲や、これからやりたい曲を残せます。
        </p>
        <input
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder="アーティスト - 曲名"
          className="h-12 w-full rounded-full border border-border bg-black/20 px-4 text-[14px] text-white outline-none placeholder:text-white/30"
        />
        {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
        <Button disabled={isPending || !raw.trim()} onClick={handleAddSong} className="w-full">
          {isPending ? "追加中..." : "曲を追加"}
        </Button>
      </section>

      {profileCoverSongs.length > 0 ? (
        <section className="space-y-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
            プロフィールから追加
          </p>
          <p className="text-[14px] leading-relaxed text-white/45">
            プロフィールに登録したコピー曲や Set List から選べます。
          </p>
          <div className="flex flex-wrap gap-2">
            {profileCoverSongs.map((song) => {
              const key = `${song.artist}::${song.title}`;
              const selected = selectedProfileSongs.some(
                (item) => `${item.artist}::${item.title}` === key
              );

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleProfileSong(song)}
                  className={`rounded-full border px-3 py-2 text-[13px] transition-quiet ${
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-white/60"
                  }`}
                >
                  {formatArtistSongLine(song.artist, song.title)}
                </button>
              );
            })}
          </div>
          <Button
            disabled={isPending || selectedProfileSongs.length === 0}
            onClick={handleAddFromProfile}
            variant="outline"
            className="w-full"
          >
            {isPending ? "追加中..." : `選択した曲を追加 (${selectedProfileSongs.length})`}
          </Button>
        </section>
      ) : null}

      <section className="space-y-6">
        {coverSongs.length > 0 ? (
          coverSongs.map((song) => (
            <article
              key={song.id}
              className="rounded-[24px] border border-border bg-subtle px-5 py-5"
            >
              <div className="flex items-start justify-between gap-3">
                <CoverSongCard
                  song={{
                    id: song.id,
                    artist: song.artist,
                    title: song.title,
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemove(song.id)}
                  disabled={isPending}
                  className="shrink-0 text-[13px] text-white/35 transition-quiet hover:text-white/60"
                >
                  削除
                </button>
              </div>
              {song.addedBy ? (
                <p className="mt-3 text-[12px] text-white/35">
                  {song.addedBy.name} が追加 ·{" "}
                  {new Date(song.createdAt).toLocaleDateString("ja-JP")}
                </p>
              ) : null}
            </article>
          ))
        ) : (
          <p className="text-[15px] leading-relaxed text-white/45">
            まだSet Listがありません。上から曲を追加してみましょう。
          </p>
        )}
      </section>
    </div>
  );
}

type ActivityPostKind = "text" | "photo" | "video" | "link";

function ActivityTab({
  bandId,
  activities,
}: {
  bandId: string;
  activities: BandDetail["activities"];
}) {
  const [body, setBody] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [kind, setKind] = useState<ActivityPostKind>("text");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const canSubmit =
    kind === "text"
      ? body.trim().length > 0
      : kind === "link"
        ? mediaUrl.trim().length > 0
        : mediaUrl.trim().length > 0;

  function handleSubmit() {
    setError(null);

    if (kind === "text" && !body.trim()) {
      setError("テキストを入力してください。");
      return;
    }

    if (kind === "link") {
      const url = mediaUrl.trim();
      if (!url) {
        setError("リンクURLを入力してください。");
        return;
      }
      if (!isHttpUrl(url)) {
        setError("https:// で始まるURLを入力してください。");
        return;
      }

      const caption = body.trim();
      const isYouTube = Boolean(parseYouTubeVideoId(url));

      startTransition(async () => {
        const result = await createBandActivityAction({
          bandId,
          kind: isYouTube ? "video" : "text",
          body: isYouTube
            ? caption || undefined
            : caption
              ? `${caption}\n${url}`
              : url,
          title: isYouTube ? caption || "Video" : undefined,
          mediaUrl: isYouTube ? url : undefined,
        });
        if (result?.error) {
          setError(result.error);
          return;
        }
        setBody("");
        setMediaUrl("");
        dispatchBandsChange();
        router.refresh();
      });
      return;
    }

    if (kind !== "text" && !mediaUrl.trim()) {
      setError(
        kind === "photo"
          ? "写真を投稿するには、画像URLを入力してください。"
          : "YouTubeなどの動画URLを入力してください。"
      );
      return;
    }

    if (kind === "video" && !isHttpUrl(mediaUrl.trim())) {
      setError("https:// で始まるURLを入力してください。");
      return;
    }

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
      dispatchBandsChange();
      router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      <section className="space-y-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Activity</p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["text", "テキスト"],
              ["photo", "写真"],
              ["video", "動画"],
              ["link", "リンク"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setKind(value)}
              className={`rounded-full px-3 py-1.5 text-[13px] ${
                kind === value
                  ? "bg-primary/10 text-primary"
                  : "border border-border text-white/55"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {kind === "link" ? (
          <>
            <input
              value={mediaUrl}
              onChange={(event) => setMediaUrl(event.target.value)}
              placeholder="https://youtube.com/watch?v=... など"
              className="h-12 w-full rounded-full border border-border bg-black/20 px-4 text-[14px] text-white outline-none placeholder:text-white/30"
            />
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="コメント（任意）"
              rows={3}
              className="w-full resize-none rounded-[22px] border border-border bg-black/20 px-4 py-4 text-[16px] leading-relaxed text-white outline-none placeholder:text-white/30"
            />
          </>
        ) : (
          <>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={
                kind === "text"
                  ? "初スタジオでした！"
                  : kind === "photo"
                    ? "キャプション（任意）"
                    : "動画タイトル（任意）"
              }
              rows={4}
              className="w-full resize-none rounded-[22px] border border-border bg-black/20 px-4 py-4 text-[16px] leading-relaxed text-white outline-none placeholder:text-white/30"
            />
            {kind !== "text" ? (
              <input
                value={mediaUrl}
                onChange={(event) => setMediaUrl(event.target.value)}
                placeholder={
                  kind === "photo"
                    ? "画像URL（必須）"
                    : "YouTube URL（例: https://youtube.com/watch?v=...）"
                }
                className="h-12 w-full rounded-full border border-border bg-black/20 px-4 text-[14px] text-white outline-none placeholder:text-white/30"
              />
            ) : null}
          </>
        )}
        {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
        <Button disabled={isPending || !canSubmit} onClick={handleSubmit} className="w-full">
          {isPending ? "投稿中..." : "記録を残す"}
        </Button>
      </section>

      <div className="space-y-8">
        {activities.map((activity) => (
          <article key={activity.id} className="space-y-3 border-l border-border pl-5">
            <p className="text-[12px] uppercase tracking-[0.14em] text-white/35">
              {new Date(activity.createdAt).toLocaleDateString("ja-JP")}
            </p>
            {activity.body ? (
              <LinkifiedText
                text={activity.body}
                className="text-[18px] leading-relaxed text-white/85"
              />
            ) : null}
            {activity.title && activity.title !== activity.body ? (
              <p className="text-[15px] text-white/60">{activity.title}</p>
            ) : null}
            {activity.mediaUrl && activity.kind === "photo" ? (
              <ActivityMediaBlock url={activity.mediaUrl} kind="photo" sizes="390px" />
            ) : null}
            {activity.mediaUrl && activity.kind === "video" ? (
              <ActivityMediaBlock
                url={activity.mediaUrl}
                title={activity.title ?? activity.body ?? "Video"}
                kind="video"
                sizes="390px"
              />
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
        まだ動画がありません。ActivityからYouTubeリンクを追加できます。
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {videos.map((video) => {
        const url = video.mediaUrl ?? "";
        const isYouTube = url ? classifyMediaUrl(url) === "youtube" : false;

        return (
          <article key={video.id} className="overflow-hidden rounded-[20px] bg-subtle">
            {url ? (
              isYouTube ? (
                <ActivityMediaBlock
                  url={url}
                  title={video.title ?? video.body ?? "Video"}
                  kind="video"
                  sizes="390px"
                  className=""
                />
              ) : (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-4 text-[14px] text-primary"
                >
                  動画を見る
                </a>
              )
            ) : (
              <div className="flex aspect-video items-center justify-center bg-black/30 text-white/30">
                Video
              </div>
            )}
            <div className="space-y-1 px-4 py-3">
              <p className="text-[11px] text-white/40">
                {new Date(video.createdAt).toLocaleDateString("ja-JP")}
              </p>
              <p className="line-clamp-2 text-[14px] leading-snug text-white/85">
                {video.title ?? video.body ?? "Untitled"}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function MembersTab({
  bandId,
  bandName,
  members,
}: {
  bandId: string;
  bandName: string;
  members: BandDetail["members"];
}) {
  return (
    <div className="space-y-6">
      <AddBandMembersPanel bandId={bandId} bandName={bandName} />

      <div className="space-y-4">
        {members.map((item) => {
        const color = item.frequencyColor as FrequencyColorHex | undefined;
        const parts = item.member.music.instruments.filter(Boolean);

        return (
          <article
            key={item.memberId}
            className="flex items-center gap-4 rounded-[24px] border border-border bg-subtle px-4 py-4"
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
    </div>
  );
}
