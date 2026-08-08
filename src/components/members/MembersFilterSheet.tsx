"use client";

import { useEffect, useState } from "react";
import { SelectableChip } from "@/components/onboarding/SelectableChip";
import {
  ACTIVITY_STYLE_OPTIONS,
} from "@/lib/music/activity-style";
import {
  EMPTY_MEMBERS_FILTER,
  type MembersFilterState,
} from "@/lib/members/filters";
import { MEMBERS_SEO } from "@/lib/seo/about-copy";

type MembersFilterSheetProps = {
  open: boolean;
  value: MembersFilterState;
  onClose: () => void;
  onApply: (value: MembersFilterState) => void;
};

export function MembersFilterSheet({
  open,
  value,
  onClose,
  onApply,
}: MembersFilterSheetProps) {
  const [draft, setDraft] = useState<MembersFilterState>(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function applyFilters() {
    onApply(draft);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end">
      <button
        type="button"
        aria-label="閉じる"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="メンバーを探す"
        className="relative mx-auto flex w-full max-w-mobile flex-col overflow-hidden rounded-t-[28px] bg-background shadow-2xl animate-in slide-in-from-bottom duration-200"
        style={{ height: "min(88dvh, 720px)" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="text-[15px] text-muted transition-opacity active:opacity-70"
          >
            キャンセル
          </button>
          <h2 className="text-[16px] font-medium text-foreground">メンバーを探す</h2>
          <button
            type="button"
            onClick={applyFilters}
            className="text-[15px] font-medium text-primary transition-opacity active:opacity-70"
          >
            完了
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6">
          <div className="space-y-8">
            <section className="space-y-3">
              <div>
                <h3 className="text-[16px] font-medium tracking-tight text-foreground">
                  {MEMBERS_SEO.partsHeading}
                </h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-white/45">
                  演奏パートが合うメンバーも表示します。
                </p>
              </div>
              <ul className="flex flex-wrap gap-2.5">
                {MEMBERS_SEO.parts.map((part) => (
                  <li key={part}>
                    <SelectableChip
                      label={part}
                      selected={draft.part === part}
                      onToggle={() =>
                        setDraft((current) => ({
                          ...current,
                          part: current.part === part ? null : part,
                        }))
                      }
                    />
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-3">
              <div>
                <h3 className="text-[16px] font-medium tracking-tight text-foreground">
                  活動スタイル
                </h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-white/45">
                  どんなバンド活動をしたいかで絞り込めます。
                </p>
              </div>
              <ul className="flex flex-wrap gap-2.5">
                {ACTIVITY_STYLE_OPTIONS.map((option) => (
                  <li key={option.id}>
                    <SelectableChip
                      label={option.label}
                      selected={draft.activityStyle === option.id}
                      onToggle={() =>
                        setDraft((current) => ({
                          ...current,
                          activityStyle:
                            current.activityStyle === option.id ? null : option.id,
                        }))
                      }
                    />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <div className="shrink-0 border-t border-border px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setDraft(EMPTY_MEMBERS_FILTER)}
            className="mb-3 w-full text-[14px] text-white/45 transition-colors hover:text-primary"
          >
            条件をクリア
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="h-12 w-full rounded-full bg-primary text-[15px] font-medium text-primary-foreground transition-opacity active:opacity-85"
          >
            この条件で探す
          </button>
        </div>
      </div>
    </div>
  );
}
