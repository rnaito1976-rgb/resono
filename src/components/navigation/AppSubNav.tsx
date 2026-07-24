type AppSubNavItem = {
  id: string;
  label: string;
};

type AppSubNavProps = {
  items: readonly AppSubNavItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export function AppSubNav({ items, activeIndex, onSelect }: AppSubNavProps) {
  return (
    <nav className="bg-background/90 backdrop-blur-xl">
      <div className="flex overflow-x-auto scrollbar-hide px-2">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(index)}
            className={`shrink-0 px-4 py-4 text-[12px] font-medium uppercase tracking-[0.14em] transition-colors ${
              activeIndex === index
                ? "border-b-2 border-primary text-white"
                : "text-white/40"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
