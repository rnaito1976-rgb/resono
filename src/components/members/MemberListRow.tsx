import Link from "next/link";
import { MemberListAvatar } from "@/components/members/MemberListAvatar";
import {
  buildMemberArtistLine,
  buildMemberPartsLocationLine,
  buildMemberPlayingStyleLine,
} from "@/lib/members/music-hints";
import { formatActivityStyleLabels } from "@/lib/music/activity-style";
import { cn } from "@/lib/utils";
import type { Member } from "@/types/member";

const LIST_ROW_AVATAR_PX = 32;

type MemberListRowProps = {
  member: Member;
  className?: string;
  resonanceScore?: number;
};

export function MemberListRow({ member, className, resonanceScore }: MemberListRowProps) {
  const partsLine = buildMemberPartsLocationLine(member);
  const artistLine = buildMemberArtistLine(member);
  const activityStyleLine = formatActivityStyleLabels(member.music);
  const playingStyle = buildMemberPlayingStyleLine(member);
  const displayScore = resonanceScore ?? member.resonanceRate;

  return (
    <Link
      href={`/member/${member.id}`}
      className={cn(
        "flex items-start gap-3 rounded-[16px] border border-border/80 bg-subtle/60 px-3.5 py-3 transition-colors hover:border-primary/30 active:opacity-90",
        className
      )}
    >
      <MemberListAvatar member={member} size={LIST_ROW_AVATAR_PX} />

      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-[15px] font-medium leading-snug tracking-tight text-foreground">
          {member.name}
        </p>

        {partsLine ? (
          <p className="text-[13px] leading-relaxed text-white/50">{partsLine}</p>
        ) : null}

        {artistLine ? (
          <p className="text-[13px] leading-relaxed text-white/60">{artistLine}</p>
        ) : null}

        {activityStyleLine ? (
          <p className="text-[13px] leading-relaxed text-white/45">{activityStyleLine}</p>
        ) : null}

        {playingStyle ? (
          <p className="text-[13px] leading-relaxed text-white/45">{playingStyle}</p>
        ) : null}

        {displayScore > 0 ? (
          <p className="pt-0.5 text-[12px] tabular-nums text-primary/85">
            共鳴度 {displayScore}%
          </p>
        ) : null}
      </div>
    </Link>
  );
}
