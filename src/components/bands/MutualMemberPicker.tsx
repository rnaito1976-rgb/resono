"use client";

import Image from "next/image";
import Link from "next/link";
import { ProfilePhotoRing } from "@/components/frequency-color/ProfilePhotoRing";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import type { MutualResonateMember } from "@/types/band";

type MutualMemberPickerProps = {
  members: MutualResonateMember[];
  selectedIds: string[];
  onToggle: (memberId: string) => void;
  emptyHref?: string;
  emptyLabel?: string;
};

export function MutualMemberPicker({
  members,
  selectedIds,
  onToggle,
  emptyHref = "/",
  emptyLabel = "Homeへ戻る",
}: MutualMemberPickerProps) {
  if (members.length === 0) {
    return (
      <div className="rounded-[28px] border border-border bg-subtle px-6 py-8 text-center">
        <p className="text-[15px] leading-relaxed text-white/55">
          追加できる共鳴済みメンバーがいません。
          <br />
          まずはHomeから共鳴してみましょう。
        </p>
        <Link href={emptyHref} className="mt-6 inline-flex text-[15px] text-primary">
          {emptyLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {members.map(({ member, frequencyColor }) => {
        const selected = selectedIds.includes(member.id);
        const color = frequencyColor as FrequencyColorHex | undefined;

        return (
          <button
            key={member.id}
            type="button"
            onClick={() => onToggle(member.id)}
            className={`flex w-full items-center gap-4 rounded-[24px] border px-4 py-4 text-left transition-quiet ${
              selected
                ? "border-primary/40 bg-[var(--frequency-color-soft)]"
                : "border-border bg-subtle"
            }`}
          >
            <ProfilePhotoRing color={color} className="h-14 w-14 rounded-full">
              <div className="relative h-14 w-14 overflow-hidden rounded-full">
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
            </ProfilePhotoRing>
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-medium">{member.name}</p>
              <p className="mt-1 text-[13px] text-white/45">
                {member.music.instruments.join(" · ") || "パート未設定"}
              </p>
            </div>
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              }`}
            >
              {selected ? "✓" : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
