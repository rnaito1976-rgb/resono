"use client";

import {
  getProfileItemLabel,
  getProfileItems,
} from "@/lib/profile/items";
import type { Member } from "@/types/member";

type ProfileItemsViewProps = {
  member: Member;
  isOwnProfile?: boolean;
  resonanceSection?: React.ReactNode;
};

/** プロフィール項目を一覧表示（カードではなく項目ベース） */
export function ProfileItemsView({
  member,
  isOwnProfile = false,
  resonanceSection,
}: ProfileItemsViewProps) {
  const items = getProfileItems(member);
  const playingParts = member.music.instruments.filter(Boolean);

  return (
    <div className="space-y-10 pb-10 pt-2">
      <div className="space-y-3 px-1">
        {playingParts.length > 0 ? (
          <p className="text-[13px] font-medium tracking-[0.18em] text-white/45">
            {playingParts.join(", ")}
          </p>
        ) : null}
        <h2 className="text-[34px] font-light tracking-tight text-white">{member.name}</h2>
        {member.aiComment ? (
          <p className="max-w-[32ch] text-[15px] leading-relaxed text-white/55">
            {member.aiComment}
          </p>
        ) : null}
      </div>

      {resonanceSection}

      <div className="space-y-8">
        {items.length > 0 ? (
          items.map((item) => (
            <section key={item.kind} className="space-y-2 border-b border-white/[0.06] pb-8">
              <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/40">
                {getProfileItemLabel(item.kind)}
              </h3>
              {item.detail ? (
                <p className="text-[13px] font-medium tracking-wide text-primary/75">
                  {item.detail}
                </p>
              ) : null}
              <p className="whitespace-pre-line text-[17px] leading-[1.7] text-white/90">
                {item.value}
              </p>
            </section>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center">
            <p className="text-[15px] leading-relaxed text-white/45">
              まだ項目がありません。
              <br />
              AIとの会話で、プロフィールが少しずつ育っていきます。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
