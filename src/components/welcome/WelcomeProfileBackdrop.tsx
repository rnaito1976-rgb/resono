import { getProfilePhotoSrc } from "@/lib/images/profilePhoto";
import type { Member } from "@/types/member";

type WelcomeProfileBackdropProps = {
  members: Member[];
};

export function WelcomeProfileBackdrop({ members }: WelcomeProfileBackdropProps) {
  const tiles = members.slice(0, 6).map((member, index) => ({
    id: member.id,
    src: getProfilePhotoSrc(member.photo, 240),
    offset: index * 34,
  }));

  if (tiles.length === 0) {
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(80,80,120,0.35),transparent_55%),radial-gradient(circle_at_70%_60%,rgba(60,90,80,0.25),transparent_50%)]"
      />
    );
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-80">
      <div className="animate-welcome-scroll flex flex-col gap-4 px-5 pt-6">
        {[...tiles, ...tiles].map((tile, index) => (
          <div
            key={`${tile.id}-${index}`}
            className="h-44 w-full rounded-[28px] bg-cover bg-center saturate-[0.85]"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.55)), url("${tile.src}")`,
              transform: `translateX(${tile.offset}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
