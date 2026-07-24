"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AppPageHeader } from "@/components/navigation/AppPageHeader";
import { MutualMemberPicker } from "@/components/bands/MutualMemberPicker";
import { createBandAction } from "@/lib/actions/bands";
import type { MutualResonateMember } from "@/types/band";
import { Button } from "@/components/ui/button";

type CreateBandFlowProps = {
  mutualMembers: MutualResonateMember[];
};

export function CreateBandFlow({ mutualMembers }: CreateBandFlowProps) {
  const router = useRouter();
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
        return;
      }
      if (result?.bandId) {
        router.push(`/bands/${result.bandId}`);
      }
    });
  }

  return (
    <div className="mx-auto min-h-dvh max-w-mobile bg-background pb-10">
      <AppPageHeader
        backHref="/bands"
        backLabel="Band一覧に戻る"
        eyebrow="Bands"
        title={step === "members" ? "Bandを作成" : "Band名を決める"}
      />

      {step === "members" ? (
        <div className="space-y-8 px-5">
          <div>
            <p className="text-[15px] leading-relaxed text-white/45">
              共鳴済みメンバーから、一緒に活動を育てる仲間を選んでください。
            </p>
          </div>

          {mutualMembers.length === 0 ? (
            <MutualMemberPicker
              members={[]}
              selectedIds={[]}
              onToggle={() => {}}
            />
          ) : (
            <MutualMemberPicker
              members={mutualMembers}
              selectedIds={selectedIds}
              onToggle={toggleMember}
            />
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
        <div className="space-y-8 px-5">
          <div>
            <p className="text-[15px] leading-relaxed text-white/45">
              {selectedMembers.map((item) => item.member.name).join("、")}
              {selectedMembers.length > 0 ? " と。" : ""}
            </p>
          </div>

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Band名"
            className="h-14 w-full rounded-[24px] border border-border bg-white/[0.04] px-5 text-[18px] text-white outline-none placeholder:text-white/30 focus:border-border"
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
