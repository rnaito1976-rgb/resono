import type { MusicDnaBar } from "@/types/music-profile";

type MusicDnaChartProps = {
  bars: MusicDnaBar[];
};

export function MusicDnaChart({ bars }: MusicDnaChartProps) {
  return (
    <div className="space-y-4 rounded-[22px] bg-subtle/55 px-5 py-5">
      <p className="text-[14px] leading-relaxed text-muted">
        好きなジャンルや傾向をAIが可視化します。
      </p>
      <div className="space-y-3.5">
        {bars.map((bar) => (
          <div key={bar.label} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[15px] text-foreground/80">{bar.label}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-foreground/[0.08]">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${bar.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
