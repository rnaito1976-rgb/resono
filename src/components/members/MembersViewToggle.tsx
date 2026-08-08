"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MembersViewMode } from "@/lib/members/view-mode";

type MembersViewToggleProps = {
  value: MembersViewMode;
  onChange: (mode: MembersViewMode) => void;
};

export function MembersViewToggle({ value, onChange }: MembersViewToggleProps) {
  return (
    <div
      className="inline-flex shrink-0 items-center rounded-full border border-border/70 bg-white/[0.03] p-0.5"
      role="group"
      aria-label="表示形式"
    >
      <button
        type="button"
        aria-label="カード表示"
        aria-pressed={value === "card"}
        onClick={() => onChange("card")}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          value === "card"
            ? "bg-white/[0.08] text-foreground"
            : "text-white/40 hover:text-white/60"
        )}
      >
        <LayoutGrid className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label="リスト表示"
        aria-pressed={value === "list"}
        onClick={() => onChange("list")}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          value === "list"
            ? "bg-white/[0.08] text-foreground"
            : "text-white/40 hover:text-white/60"
        )}
      >
        <List className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}
