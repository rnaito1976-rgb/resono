import Image from "next/image";
import Link from "next/link";
import { ResonateButton } from "@/components/ResonateButton";
import { getPlayingParts } from "@/lib/resonance/dialogue";
import { Member } from "@/types/member";
import { ResonanceBadge, TagList } from "@/components/ui";

type PersonCardProps = {
  member: Member;
  variant?: "default" | "ambient";
  resonanceScore?: number;
  isOwnCard?: boolean;
  priority?: boolean;
};

function getOpenParts(member: Member): string[] {
  const parts = member.lookingFor?.parts;
  return Array.isArray(parts) ? parts.filter(Boolean) : [];
}

export function PersonCard({
  member,
  variant = "default",
  resonanceScore,
  isOwnCard = false,
  priority = false,
}: PersonCardProps) {
  const isAmbient = variant === "ambient";
  const score = resonanceScore ?? member.resonanceRate;
  const openParts = getOpenParts(member);
  const playingParts = getPlayingParts(member);

  return (
    <article className="overflow-hidden rounded-[28px] bg-subtle">
      <div className="relative aspect-[4/5] w-full">
        <Image
          src={member.photo}
          alt={member.name}
          fill
          className="object-cover"
          sizes="390px"
          priority={priority || (!isAmbient && member.id === "1")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              {playingParts.length > 0 ? (
                <p className="mb-1.5 text-[13px] font-medium tracking-wide text-white/75">
                  {playingParts.join(" · ")}
                </p>
              ) : isOwnCard ? (
                <Link
                  href={`/member/${member.id}/edit`}
                  className="mb-1.5 inline-block text-[13px] tracking-wide text-white/45 underline-offset-2 hover:text-white/70 hover:underline"
                >
                  演奏パートを追加
                </Link>
              ) : null}
              <h2 className="text-[28px] font-light tracking-tight">{member.name}</h2>
            </div>
            {!isOwnCard ? (
              <div className="shrink-0 text-right">
                <p className="mb-0.5 text-[10px] uppercase tracking-[0.18em] text-white/50">
                  共鳴度
                </p>
                <ResonanceBadge rate={score} />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-5 px-6 pb-6 pt-5">
        {openParts.length > 0 ? (
          <div className="space-y-2.5">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
              募集パート
            </p>
            <div className="flex flex-wrap gap-2">
              {openParts.map((part) => (
                <span
                  key={part}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[13px] text-white/90"
                >
                  {part}
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-primary">
                    Open
                  </span>
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <TagList items={member.tags} />

        <blockquote className="border-l border-white/20 pl-4 text-[15px] leading-relaxed text-white/75">
          {member.aiComment}
        </blockquote>

        {!isAmbient ? (
          <div className="space-y-3">
            {!isOwnCard ? <ResonateButton memberId={member.id} /> : null}
            {isOwnCard ? (
              <Link
                href="/discover"
                className="flex h-12 w-full items-center justify-center rounded-full border border-white/15 text-[15px] font-medium tracking-wide text-white/80 transition-opacity active:opacity-70"
              >
                もう少し教える
              </Link>
            ) : null}
            <Link
              href={`/member/${member.id}`}
              className="flex h-12 w-full items-center justify-center rounded-full border border-white/15 text-[15px] font-medium tracking-wide text-white transition-opacity active:opacity-70"
            >
              {isOwnCard ? "マイページ" : "もっと知る"}
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
