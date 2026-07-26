type MusicTagGridProps = {
  items: string[];
};

export function MusicTagGrid({ items }: MusicTagGridProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-border/70 bg-subtle/40 px-4 py-2 text-[15px] tracking-tight text-foreground/85"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
