import Image from "next/image";
import Link from "next/link";
import { Member } from "@/types/member";
import { ResonanceBadge, TagList } from "@/components/ui";

type PersonCardProps = {
  member: Member;
};

export function PersonCard({ member }: PersonCardProps) {
  return (
    <article className="overflow-hidden rounded-[28px] bg-subtle">
      <div className="relative aspect-[4/5] w-full">
        <Image
          src={member.photo}
          alt={member.name}
          fill
          className="object-cover"
          sizes="390px"
          priority={member.id === "1"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-[28px] font-light tracking-tight">{member.name}</h2>
            <div className="text-right">
              <p className="mb-0.5 text-[10px] uppercase tracking-[0.18em] text-white/50">
                共鳴率
              </p>
              <ResonanceBadge rate={member.resonanceRate} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-6 pb-6 pt-5">
        <TagList items={member.tags} />

        <blockquote className="border-l border-white/20 pl-4 text-[15px] leading-relaxed text-white/75">
          {member.aiComment}
        </blockquote>

        <Link
          href={`/member/${member.id}`}
          className="flex h-12 w-full items-center justify-center rounded-full bg-white text-[15px] font-medium tracking-wide text-black transition-opacity active:opacity-70"
        >
          もっと知る
        </Link>
      </div>
    </article>
  );
}
