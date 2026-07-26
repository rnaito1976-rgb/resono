import type { CoverSong } from "@/types/music-profile";

type CoverSongCardProps = {
  song: CoverSong;
};

/** Live Ritual と同じ表示: アーティスト → 曲名 */
export function CoverSongCard({ song }: CoverSongCardProps) {
  return (
    <article className="space-y-2 border-b border-white/[0.06] pb-6 last:border-b-0 last:pb-0">
      {song.artist ? (
        <p className="text-[13px] font-medium tracking-wide text-primary/75">
          {song.artist}
        </p>
      ) : null}
      <p className="whitespace-pre-line text-[17px] leading-[1.7] text-white/90">
        {song.title}
      </p>
    </article>
  );
}
