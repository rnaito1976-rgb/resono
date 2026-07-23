"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { createBandAction } from "@/lib/actions/bands";
import type { MutualResonateMember } from "@/types/band";
import { Button } from "@/components/ui/button";
import { ProfilePhotoRing } from "@/components/frequency-color/ProfilePhotoRing";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";

type CreateBandFlowProps = {
  mutualMembers: MutualResonateMember[];
};

export function CreateBandFlow({ mutualMembers }: CreateBandFlowProps) {
  const [step, setStep] = useState<"members" | "name">("members");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedMembers = useMemo(
    () => mutualMembers.filter((item) => selectedIds.includes(item.member.id)),
    [mutualMembers, selectedIds]
  );

  function toggleMember(memberId: string) {
    setSelectedIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
    );
  }

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const result = await createBandAction({
        name,
        memberIds: selectedIds,
      });
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mx-auto min-h-dvh max-w-mobile bg-background px-5 pb-10 pt-6">
      <header className="mb-8 flex items-center">
        <Link
          href="/bands"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors active:bg-white/10"
          aria-label="戻る"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      </header>

      {step === "members" ? (
        <div className="space-y-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
              New Band
            </p>
            <h1 className="mt-3 text-[28px] font-light tracking-tight">Bandを作成</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-white/45">
              共鳴済みメンバーから、一緒に活動を育てる仲間を選んでください。
            </p>
          </div>

          {mutualMembers.length === 0 ? (
            <div className="rounded-[28px] border border-white/8 bg-subtle px-6 py-8 text-center">
              <p className="text-[15px] leading-relaxed text-white/55">
                まだ共鳴済みメンバーがいません。
                <br />
                まずはHomeから共鳴してみましょう。
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex text-[15px] text-primary"
              >
                Homeへ戻る
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {mutualMembers.map(({ member, frequencyColor }) => {
                const selected = selectedIds.includes(member.id);
                const color = frequencyColor as FrequencyColorHex | undefined;

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMember(member.id)}
                    className={`flex w-full items-center gap-4 rounded-[24px] border px-4 py-4 text-left transition-quiet ${
                      selected
                        ? "border-primary/40 bg-[var(--frequency-color-soft)]"
                        : "border-white/8 bg-subtle"
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
                          : "border-white/15"
                      }`}
                    >
                      {selected ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            disabled={selectedIds.length === 0}
            onClick={() => setStep("name")}
          >
            次へ
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
              Band Name
            </p>
            <h1 className="mt-3 text-[28px] font-light tracking-tight">Band名を決める</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-white/45">
              {selectedMembers.map((item) => item.member.name).join("、")}
              {selectedMembers.length > 0 ? " と。" : ""}
            </p>
          </div>

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Band名"
            className="h-14 w-full rounded-[24px] border border-white/10 bg-white/[0.04] px-5 text-[18px] text-white outline-none placeholder:text-white/30 focus:border-white/25"
          />

          {error ? <p className="text-[13px] text-red-300">{error}</p> : null}

          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full"
              disabled={!name.trim() || isPending}
              onClick={handleCreate}
            >
              {isPending ? "作成中..." : "Bandを作成"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => setStep("members")}
            >
              戻る
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
