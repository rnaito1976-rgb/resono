type WelcomeProfileBackdropProps = {
  members?: unknown[];
};

/** Welcome 背景: 外部画像なしの CSS のみ（LCP 悪化を防ぎ JS もゼロ） */
export function WelcomeProfileBackdrop(_props: WelcomeProfileBackdropProps) {
  const tiles = [
    "from-violet-900/40 via-fuchsia-900/20 to-transparent",
    "from-emerald-900/35 via-teal-900/15 to-transparent",
    "from-amber-900/30 via-orange-900/15 to-transparent",
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
      <div className="animate-welcome-scroll flex flex-col gap-4 px-5 pt-6">
        {[...tiles, ...tiles].map((gradient, index) => (
          <div
            key={index}
            className={`h-44 w-full rounded-[28px] bg-gradient-to-br ${gradient} ring-1 ring-white/10`}
            style={{ transform: `translateX(${(index % tiles.length) * 28}px)` }}
          />
        ))}
      </div>
    </div>
  );
}
