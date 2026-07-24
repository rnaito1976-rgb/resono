"use client";

type ConversationStartersProps = {
  starters: string[];
  onSelect: (starter: string) => void;
  disabled?: boolean;
};

export function ConversationStarters({
  starters,
  onSelect,
  disabled = false,
}: ConversationStartersProps) {
  if (starters.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 pb-3">
      <p className="px-1 text-[11px] uppercase tracking-[0.16em] text-white/40">
        会話のきっかけ
      </p>
      <div className="flex flex-col gap-2">
        {starters.map((starter) => (
          <button
            key={starter}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(starter)}
            className="rounded-[22px] border border-border bg-subtle px-4 py-3 text-left text-[14px] leading-relaxed text-white/75 transition-colors hover:bg-black/20 disabled:opacity-50"
          >
            {starter}
          </button>
        ))}
      </div>
    </div>
  );
}
