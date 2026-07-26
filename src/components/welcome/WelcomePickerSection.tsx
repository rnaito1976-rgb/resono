import type { ReactNode } from "react";

type WelcomePickerSectionProps = {
  label: string;
  children: ReactNode;
};

export function WelcomePickerSection({ label, children }: WelcomePickerSectionProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-[13px] font-medium tracking-wide text-white/45">{label}</h3>
      {children}
    </section>
  );
}

type WelcomeSelectedTagsProps = {
  items: string[];
  onRemove: (item: string) => void;
};

export function WelcomeSelectedTags({ items, onRemove }: WelcomeSelectedTagsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onRemove(item)}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-[var(--frequency-color-soft)] px-3 py-1.5 text-[14px] text-foreground transition-quiet active:opacity-80"
        >
          {item}
          <span aria-hidden className="text-white/45">
            ×
          </span>
        </button>
      ))}
    </div>
  );
}
