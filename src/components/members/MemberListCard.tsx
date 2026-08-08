import Link from "next/link";
import { MemberListAvatar } from "@/components/members/MemberListAvatar";
import { MemberPresenceBadge } from "@/components/person-card/MemberPresenceBadge";
import {
  buildMemberCardMeta,
  buildMemberMusicHints,
} from "@/lib/members/music-hints";
import { cn } from "@/lib/utils";
import type { Member } from "@/types/member";

type MemberListCardProps = {
  member: Member;
  className?: string;
};

export function MemberListCard({ member, className }: MemberListCardProps) {
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
        <MemberListAvatar member={member} />

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
