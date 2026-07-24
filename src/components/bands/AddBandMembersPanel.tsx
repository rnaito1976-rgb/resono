"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MutualMemberPicker } from "@/components/bands/MutualMemberPicker";
import { addBandMembersAction } from "@/lib/actions/bands";
import { dispatchBandsChange } from "@/lib/bands/events";
import type { MutualResonateMember } from "@/types/band";
import { Button } from "@/components/ui/button";

type AddBandMembersPanelProps = {
  bandId: string;
  bandName: string;
  addableMembers: MutualResonateMember[];
};

export function AddBandMembersPanel({
  bandId,
  bandName,
  addableMembers,
}: AddBandMembersPanelProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleMember(memberId: string) {
    setSelectedIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
    );
  }

  function handleAdd() {
    if (selectedIds.length === 0) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await addBandMembersAction({
        bandId,
        memberIds: selectedIds,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      setSelectedIds([]);
      setExpanded(false);
      dispatchBandsChange();
      router.refresh();
    });
  }

  if (addableMembers.length === 0) {
    return (
      <p className="rounded-[24px] border border-dashed border-border px-5 py-4 text-[14px] leading-relaxed text-white/45">
        追加できる共鳴済みメンバーがいません。Homeで新しい共鳴相手を見つけてから、ここに戻って追加できます。
      </p>
    );
  }

  return (
    <section className="space-y-4 rounded-[28px] border border-border bg-subtle px-5 py-5">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
          Add Members
        </p>
        <p className="text-[15px] leading-relaxed text-white/55">
          共鳴済みメンバーを {bandName} に追加できます。
        </p>
      </div>

      {!expanded ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setExpanded(true)}
        >
          メンバーを追加
        </Button>
      ) : (
        <div className="space-y-4">
          <MutualMemberPicker
            members={addableMembers}
            selectedIds={selectedIds}
            onToggle={toggleMember}
            emptyHref="/"
          />
          {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
          <div className="space-y-3">
            <Button
              type="button"
              className="w-full"
              disabled={selectedIds.length === 0 || isPending}
              onClick={handleAdd}
            >
              {isPending ? "追加中..." : "選択したメンバーを追加"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isPending}
              onClick={() => {
                setExpanded(false);
                setSelectedIds([]);
                setError(null);
              }}
            >
              キャンセル
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
