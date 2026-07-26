"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import { getProfilePhotoSrc } from "@/lib/images/profilePhoto";
import type { Member } from "@/types/member";

type WelcomeLockedMemberCardProps = {
  member: Member;
};

export function WelcomeLockedMemberCard({ member }: WelcomeLockedMemberCardProps) {
  const parts = member.music.instruments.filter(Boolean).slice(0, 2);

  return (
    <article className="relative overflow-hidden rounded-[28px] border border-border bg-subtle">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={getProfilePhotoSrc(member.photo, 480)}
          alt=""
          fill
          className="scale-105 object-cover blur-md"
          sizes="320px"
        />
        <div className="absolute inset-0 bg-background/55 backdrop-blur-[2px]" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/80">
            <Lock className="h-5 w-5 text-muted" strokeWidth={1.75} />
          </div>
          <p className="text-[18px] font-medium tracking-tight">{member.name}</p>
          {parts.length > 0 ? (
            <p className="mt-1 text-[13px] text-white/45">{parts.join(" · ")}</p>
          ) : null}
          {member.aiComment ? (
            <p className="mt-3 line-clamp-2 text-[14px] leading-relaxed text-white/45">
              {member.aiComment}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

type WelcomeSignupPromptProps = {
  matchedMembers: Member[];
  musicDna: { label: string; stars: number }[];
  renderStars: (count: number) => string;
  isLoggedIn?: boolean;
};

export function WelcomeResultsStep({
  matchedMembers,
  musicDna,
  renderStars,
  isLoggedIn = false,
}: WelcomeSignupPromptProps) {
  return (
    <div className="flex min-h-dvh flex-col px-5 pb-10 pt-6">
      <div className="flex-1 space-y-8 overflow-y-auto pb-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
            Result
          </p>
          <h2 className="mt-1 text-[28px] font-light tracking-tight">あなたのMusic DNA</h2>
        </div>

        <div className="space-y-3">
          {musicDna.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border bg-subtle px-5 py-4"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-[15px] font-medium">{item.label}</p>
                <p className="text-[14px] tracking-[0.12em] text-primary">
                  {renderStars(item.stars)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <p className="text-[15px] leading-relaxed text-white/45">
            あなたと共鳴しそうなメンバーが見つかりました。
          </p>

          <div className="space-y-3">
            {matchedMembers.map((member) => (
              <WelcomeLockedMemberCard key={member.id} member={member} />
            ))}
          </div>

          <p className="text-center text-[14px] text-white/45">続きを見るには無料登録</p>
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-6">
        {isLoggedIn ? (
          <Link
            href="/onboarding"
            className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-[15px] font-medium text-primary-foreground transition-quiet active:opacity-85"
          >
            プロフィールを完成させる
          </Link>
        ) : (
          <Link
            href="/signup?from=welcome"
            className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-[15px] font-medium text-primary-foreground transition-quiet active:opacity-85"
          >
            無料ではじめる
          </Link>
        )}

        {!isLoggedIn ? (
          <div className="space-y-2 text-center">
            <p className="text-[14px] text-white/45">すでにアカウントをお持ちですか？</p>
            <Link
              href="/login?from=welcome"
              className="inline-flex text-[15px] font-medium text-primary transition-quiet active:opacity-70"
            >
              ログイン
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
