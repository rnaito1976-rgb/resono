import Link from "next/link";
import { MemberListAvatar } from "@/components/members/MemberListAvatar";
import { MemberPresenceBadge } from "@/components/person-card/MemberPresenceBadge";
import {
  buildMemberArtistLine,
  buildMemberCardMeta,
  buildMemberMusicHints,
  buildMemberPlayingStyleLine,
} from "@/lib/members/music-hints";
import { formatActivityStyleLabels } from "@/lib/music/activity-style";
import { cn } from "@/lib/utils";
import type { Member } from "@/types/member";

const GRID_AVATAR_PX = 44;

type MemberListCardProps = {
  member: Member;
  className?: string;
  layout?: "row" | "grid";
};

export function MemberListCard({
  member,
  className,
  layout = "row",
}: MemberListCardProps) {
  if (layout === "grid") {
    return <MemberListGridCard member={member} className={className} />;
  }

  return <MemberListRowCard member={member} className={className} />;
}

function MemberListRowCard({ member, className }: MemberListCardProps) {
  const meta = buildMemberCardMeta(member);
  const hints = buildMemberMusicHints(member, 4);
  const subtitle = meta.length > 0 ? meta.join(" · ") : null;

  return (
    <Link
      href={`/member/${member.id}`}
      className={cn(
        "block rounded-[20px] border border-border/80 bg-subtle/60 px-4 py-4 transition-colors hover:border-primary/30 active:opacity-90",
        className
      )}
    >
      <div className="flex items-start gap-3.5">
        <MemberListAvatar member={member} size={48} />

        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="space-y-2">
            <MemberPresenceBadge member={member} />

            <div>
              <p className="text-[16px] font-medium leading-snug tracking-tight text-foreground">
                {member.name}
              </p>
              {subtitle ? (
                <p className="mt-0.5 text-[13px] text-white/50">{subtitle}</p>
              ) : null}
            </div>
          </div>

          {hints.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {hints.map((hint) => (
                <span
                  key={hint}
                  className="rounded-full border border-border/70 bg-white/[0.04] px-2.5 py-1 text-[12px] leading-none text-white/75"
                >
                  {hint}
                </span>
              ))}
            </div>
          ) : null}

          {member.lookingFor.parts.length > 0 ? (
            <p className="text-[12px] text-white/40">
              募集 {member.lookingFor.parts.join(" · ")}
            </p>
          ) : null}

          <p className="text-[12px] tabular-nums text-primary/85">
            共鳴度 {member.resonanceRate}%
          </p>

          {member.aiComment ? (
            <p className="line-clamp-2 text-[13px] leading-relaxed text-white/50">
              {member.aiComment}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function MemberListGridCard({ member, className }: MemberListCardProps) {
  const meta = buildMemberCardMeta(member);
  const subtitle = meta.length > 0 ? meta.join(" · ") : null;
  const artistLine = buildMemberArtistLine(member);
  const activityStyleLine = formatActivityStyleLabels(member.music);
  const playingStyle = buildMemberPlayingStyleLine(member);

  return (
    <Link
      href={`/member/${member.id}`}
      className={cn(
        "flex h-full flex-col rounded-[18px] border border-border/80 bg-subtle/60 px-3.5 py-3.5 transition-colors hover:border-primary/30 active:opacity-90",
        className
      )}
    >
      <div className="flex flex-col gap-2.5">
        <MemberListAvatar member={member} size={GRID_AVATAR_PX} />

        <div className="min-w-0 space-y-1.5">
          <MemberPresenceBadge member={member} />

          <p className="text-[15px] font-medium leading-snug tracking-tight text-foreground">
            {member.name}
          </p>

          {subtitle ? (
            <p className="text-[12px] leading-relaxed text-white/50">{subtitle}</p>
          ) : null}

          {artistLine ? (
            <p className="text-[12px] leading-relaxed text-white/60">{artistLine}</p>
          ) : null}

          {activityStyleLine ? (
            <p className="text-[12px] leading-relaxed text-white/45">{activityStyleLine}</p>
          ) : null}

          {playingStyle ? (
            <p className="text-[12px] leading-relaxed text-white/45">{playingStyle}</p>
          ) : null}

          <p className="text-[11px] tabular-nums text-primary/85">
            共鳴度 {member.resonanceRate}%
          </p>

          {member.aiComment ? (
            <p className="line-clamp-2 text-[12px] leading-relaxed text-white/45">
              {member.aiComment}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
