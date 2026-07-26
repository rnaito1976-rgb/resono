import Image from "next/image";
import type { CoverSong } from "@/types/music-profile";

type CoverSongCardProps = {
  song: CoverSong;
};

function artworkGradient(title: string): string {
  const hash = title.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const hues = [200, 260, 320, 160];
  const hue = hues[hash % hues.length];
  return `linear-gradient(135deg, hsl(${hue} 45% 28%) 0%, hsl(${(hue + 40) % 360} 35% 18%) 100%)`;
}

export function CoverSongCard({ song }: CoverSongCardProps) {
  return (
    <article className="flex items-center gap-4 rounded-[20px] bg-subtle/55 px-4 py-3.5">
      <div
        className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[12px]"
        style={{ background: song.artworkUrl ? undefined : artworkGradient(song.title) }}
      >
        {song.artworkUrl ? (
          <Image
            src={song.artworkUrl}
            alt=""
            fill
            className="object-cover"
            sizes="52px"
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center text-[18px] font-medium uppercase text-white/70"
            aria-hidden
          >
            {song.title.charAt(0)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-medium tracking-tight text-foreground">
          {song.title}
        </p>
        <p className="mt-0.5 truncate text-[14px] text-muted">{song.artist}</p>
      </div>
    </article>
  );
}
