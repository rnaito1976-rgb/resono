"use client";

import { useMemo, useState } from "react";
import {
  PROFILE_GROW_FIELD_LABELS,
  PROFILE_GROW_SECTION_LABELS,
} from "@/lib/profile/grow/labels";
import { groupCandidatesBySection } from "@/lib/profile/grow/extract";
import type { ProfileGrowCandidate } from "@/types/profile-grow";
import { Button } from "@/components/ui/button";

type ProfileGrowReviewProps = {
  candidates: ProfileGrowCandidate[];
  onSave: (candidates: ProfileGrowCandidate[]) => void;
  onBack: () => void;
  isSaving?: boolean;
  error?: string | null;
};

function formatCandidateValue(candidate: ProfileGrowCandidate): string {
  if (candidate.detail) {
    return `${candidate.detail} - ${candidate.value}`;
  }

  return candidate.value;
}

export function ProfileGrowReview({
  candidates,
  onSave,
  onBack,
  isSaving = false,
  error = null,
}: ProfileGrowReviewProps) {
  const [editable, setEditable] = useState(candidates);
  const grouped = useMemo(() => groupCandidatesBySection(editable), [editable]);

  function updateValue(id: string, value: string) {
    setEditable((current) =>
      current.map((candidate) =>
        candidate.id === id ? { ...candidate, value } : candidate
      )
    );
  }

  if (editable.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-[15px] leading-relaxed text-white/55">
          今回の会話から追加できる新しい情報は見つかりませんでした。
        </p>
        <Button type="button" variant="outline" className="mt-8 w-full" onClick={onBack}>
          もう一度話す
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          Review
        </p>
        <h2 className="mt-3 text-[24px] font-light tracking-tight text-white">
          プロフィール更新候補
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-white/45">
          会話から拾えた新しい情報だけをまとめました。保存前に編集できます。
        </p>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto pb-6">
        {(["about", "music", "band"] as const).map((section) => {
          const items = grouped[section];
          if (items.length === 0) {
            return null;
          }

          return (
            <section key={section} className="space-y-4">
              <h3 className="text-[12px] font-medium uppercase tracking-[0.18em] text-white/40">
                {PROFILE_GROW_SECTION_LABELS[section]}
              </h3>
              <div className="space-y-4">
                {items.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="rounded-[22px] border border-border bg-white/[0.03] px-4 py-4"
                  >
                    <p className="text-[12px] uppercase tracking-[0.16em] text-primary/75">
                      {PROFILE_GROW_FIELD_LABELS[candidate.field]}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[18px] text-primary">+</span>
                      <input
                        value={candidate.value}
                        onChange={(event) => updateValue(candidate.id, event.target.value)}
                        className="min-w-0 flex-1 bg-transparent text-[16px] text-white outline-none"
                        style={{ fontSize: 16 }}
                      />
                    </div>
                    {candidate.detail ? (
                      <p className="mt-2 text-[13px] text-white/45">{candidate.detail}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="space-y-3 border-t border-border pt-5">
        {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={isSaving}
          onClick={() => onSave(editable.filter((item) => item.value.trim()))}
        >
          {isSaving ? "保存中..." : "保存する"}
        </Button>
        <Button type="button" size="lg" variant="outline" className="w-full" onClick={onBack}>
          編集する
        </Button>
      </div>
    </div>
  );
}
