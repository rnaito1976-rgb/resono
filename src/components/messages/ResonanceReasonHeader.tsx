import type { ResonanceReason } from "@/lib/resonance/matching";

type ResonanceReasonHeaderProps = {
  reason: ResonanceReason;
};

export function ResonanceReasonHeader({ reason }: ResonanceReasonHeaderProps) {
  return (
    <div className="border-b border-white/8 bg-black/40 px-5 py-5 backdrop-blur-xl">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
        共鳴理由
      </p>
      <p className="mt-2 text-2xl font-light tabular-nums tracking-tight">
        共鳴率 {reason.score}%
      </p>

      {reason.commonPoints.length > 0 ? (
        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">
            共通点
          </p>
          <ul className="mt-2 space-y-1.5">
            {reason.commonPoints.map((point) => (
              <li key={point} className="text-[15px] leading-relaxed text-white/85">
                ・{point}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">
          AIコメント
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-white/80">
          「{reason.aiComment}」
        </p>
      </div>
    </div>
  );
}
