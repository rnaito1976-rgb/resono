"use client";

type FormTagPickerTriggerProps = {
  selected: string[];
  placeholder: string;
  onClick: () => void;
};

export function FormTagPickerTrigger({
  selected,
  placeholder,
  onClick,
}: FormTagPickerTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-border bg-white/[0.03] px-4 py-3.5 text-left transition-quiet active:bg-white/[0.06]"
    >
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <span
              key={item}
              className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[14px] text-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-[15px] text-white/30">{placeholder}</span>
      )}
    </button>
  );
}
