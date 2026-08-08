import { buildMemberCardMeta, buildMemberMusicHints } from "@/lib/members/music-hints";
import type { Member } from "@/types/member";

type PersonCardMusicSnapshotProps = {
  member: Member;
};

export function PersonCardMusicSnapshot({ member }: PersonCardMusicSnapshotProps) {
  const meta = buildMemberCardMeta(member);
  const hints = buildMemberMusicHints(member);

  if (meta.length === 0 && hints.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      {meta.length > 0 ? (
        <p className="text-[14px] leading-relaxed text-white/60">{meta.join(" · ")}</p>
      ) : null}
      {hints.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {hints.map((hint) => (
            <span
              key={hint}
              className="rounded-full border border-border/70 bg-white/[0.03] px-3 py-1.5 text-[13px] text-white/75"
            >
              {hint}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
