"use client";

import Link from "next/link";
import type { ProfileCard } from "@/types/profile-card";
import type { Member } from "@/types/member";

type ProfileCardTileProps = {
  card: ProfileCard;
  index: number;
};

const CARD_ACCENTS = [
  "from-white/[0.08] to-white/[0.02]",
  "from-primary/10 to-white/[0.02]",
  "from-violet-500/10 to-white/[0.02]",
  "from-emerald-500/10 to-white/[0.02]",
];

/** Apple Journal 風のプロフィールカード */
export function ProfileCardTile({ card, index }: ProfileCardTileProps) {
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  return (
    <article
      className={`rounded-[28px] bg-gradient-to-br ${accent} p-7 ring-1 ring-white/10`}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/40">
        {card.title}
      </p>
      {card.subtitle ? (
        <p className="mt-4 text-[13px] font-medium uppercase tracking-[0.16em] text-primary/80">
          {card.subtitle}
        </p>
      ) : null}
      <p className="mt-3 whitespace-pre-line text-[22px] font-light leading-[1.45] tracking-tight text-white">
        {card.content}
      </p>
    </article>
  );
}

type ProfileJournalProps = {
  member: Member;
  isOwnProfile?: boolean;
  resonanceSection?: React.ReactNode;
};

export function ProfileJournal({
  member,
  isOwnProfile = false,
  resonanceSection,
}: ProfileJournalProps) {
  const cards = member.portrait.profileCards ?? [];
  const playingParts = member.music.instruments.filter(Boolean);

  return (
    <div className="space-y-8 pb-10 pt-2">
      <div className="space-y-3 px-1">
        {playingParts.length > 0 ? (
          <p className="text-[13px] font-medium tracking-[0.18em] text-white/45">
            {playingParts.join(" · ")}
          </p>
        ) : null}
        <h2 className="text-[34px] font-light tracking-tight text-white">{member.name}</h2>
        {member.aiComment ? (
          <p className="max-w-[30ch] text-[15px] leading-relaxed text-white/55">
            {member.aiComment}
          </p>
        ) : null}
      </div>

      {resonanceSection}

      <div className="space-y-5">
        {cards.length > 0 ? (
          cards.map((card, index) => (
            <ProfileCardTile key={card.id} card={card} index={index} />
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-white/10 px-7 py-10 text-center">
            <p className="text-[15px] leading-relaxed text-white/45">
              まだカードがありません。
              <br />
              AIとの会話で、音楽人生のアルバムが育っていきます。
            </p>
          </div>
        )}
      </div>

      {isOwnProfile ? (
        <Link
          href="/discover"
          className="flex h-12 items-center justify-center rounded-full border border-border bg-white/[0.03] text-[15px] font-medium text-white/85 transition-quiet active:opacity-80"
        >
          AIと話してカードを追加
        </Link>
      ) : null}
    </div>
  );
}
