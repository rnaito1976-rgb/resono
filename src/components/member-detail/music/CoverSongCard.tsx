import Image from "next/image";
import type { CoverSong } from "@/types/music-profile";

type CoverSongCardProps = {
  song: CoverSong;
};

export function CoverSongCard({ song }: CoverSongCardProps) {
  return (
    <article className="flex items-center gap-4 rounded-[20px] bg-subtle/55 px-4 py-3.5">
      {song.artworkUrl ? (
        <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[12px]">
          <Image
            src={song.artworkUrl}
            alt=""
            fill
            className="object-cover"
            sizes="52px"
          />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-medium tracking-tight text-foreground">
          {song.title}
        </p>
        {song.artist ? (
          <p className="mt-0.5 truncate text-[14px] text-muted">{song.artist}</p>
        ) : null}
      </div>
    </article>
  );
}
