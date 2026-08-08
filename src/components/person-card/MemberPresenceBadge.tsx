import {
  getMemberPresenceKind,
  MEMBER_PRESENCE_LABELS,
} from "@/lib/members/member-presence";
import type { Member } from "@/types/member";
import { cn } from "@/lib/utils";

type MemberPresenceBadgeProps = {
  member: Member;
  className?: string;
};

export function MemberPresenceBadge({ member, className }: MemberPresenceBadgeProps) {
  const kind = getMemberPresenceKind(member);
  const label = MEMBER_PRESENCE_LABELS[kind];

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1.5 text-[12px] font-medium leading-snug",
        kind === "recruiting"
          ? "border-primary/35 bg-primary/10 text-primary"
          : "border-border/80 bg-white/[0.03] text-white/70",
        className
      )}
    >
      {label}
    </span>
  );
}
