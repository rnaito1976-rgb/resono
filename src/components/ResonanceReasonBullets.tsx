import type { ResonanceReason } from "@/lib/resonance/matching";

type ResonanceReasonBulletsProps = {
  reason: ResonanceReason;
  compact?: boolean;
  limit?: number;
};

export function ResonanceReasonBullets({
  reason,
  compact = false,
  limit,
}: ResonanceReasonBulletsProps) {
  if (reason.commonPoints.length === 0) {
    return null;
  }

  const points =
    limit != null ? reason.commonPoints.slice(0, limit) : reason.commonPoints;

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
        共鳴ポイント
      </p>
      <ul className="space-y-1.5">
        {points.map((point) => (
          <li
            key={point}
            className={`flex items-start gap-2 leading-relaxed text-white/80 ${
              compact ? "text-[14px]" : "text-[15px]"
            }`}
          >
            <span className="mt-[1px] text-primary" aria-hidden>
              ✓
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResonanceReasonHeader({ reason }: { reason: ResonanceReason }) {
  return (
    <section className="mb-5 space-y-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
        Resonance
      </p>
      <p className="mt-3 text-[28px] font-light tabular-nums tracking-tight">
        {reason.score}%
      </p>

      <div className="mt-4">
        <ResonanceReasonBullets reason={reason} />
      </div>

      <div className="mt-4 rounded-[22px] border border-border bg-black/20 px-4 py-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">
          AIコメント
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-white/80">
          {reason.aiComment}
        </p>
      </div>
    </section>
  );
}
