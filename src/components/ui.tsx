import type { ReactNode } from "react";

type TagListProps = {
  items: string[];
  variant?: "default" | "accent";
};

export function TagList({ items, variant = "default" }: TagListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={
            variant === "accent"
              ? "rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs tracking-wide text-accent"
              : "rounded-full border border-white/10 px-3 py-1 text-xs tracking-wide text-white/70"
          }
        >
          {item}
        </span>
      ))}
    </div>
  );
}

type SectionBlockProps = {
  label: string;
  children: ReactNode;
};

export function SectionBlock({ label, children }: SectionBlockProps) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
        {label}
      </p>
      <div className="text-[15px] leading-relaxed text-white/90">{children}</div>
    </div>
  );
}

type ResonanceBadgeProps = {
  rate: number;
  size?: "sm" | "lg";
};

export function ResonanceBadge({ rate, size = "sm" }: ResonanceBadgeProps) {
  return (
    <div className="flex items-baseline gap-1">
      <span
        className={
          size === "lg"
            ? "text-4xl font-light tabular-nums tracking-tight"
            : "text-2xl font-light tabular-nums tracking-tight"
        }
      >
        {rate}
      </span>
      <span
        className={
          size === "lg"
            ? "text-sm font-medium text-accent"
            : "text-xs font-medium text-accent"
        }
      >
        %
      </span>
    </div>
  );
}
