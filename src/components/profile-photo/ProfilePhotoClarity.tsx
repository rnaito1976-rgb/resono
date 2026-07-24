import type { PhotoClarityResult } from "@/lib/profile-photo/types";

const LEVEL_STYLES: Record<
  PhotoClarityResult["level"],
  { badge: string; text: string }
> = {
  excellent: {
    badge: "border-primary/35 bg-primary/10 text-primary",
    text: "text-primary/90",
  },
  great: {
    badge: "border-white/15 bg-white/[0.05] text-[#F6F6F6]",
    text: "text-white/70",
  },
  good: {
    badge: "border-white/10 bg-white/[0.04] text-white/75",
    text: "text-white/60",
  },
  "needs-improvement": {
    badge: "border-amber-400/25 bg-amber-400/10 text-amber-100/90",
    text: "text-amber-100/75",
  },
};

type ProfilePhotoClarityProps = {
  clarity: PhotoClarityResult;
};

export function ProfilePhotoClarity({ clarity }: ProfilePhotoClarityProps) {
  const styles = LEVEL_STYLES[clarity.level];

  return (
    <div className="space-y-4 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
            伝わりやすさ
          </p>
          <p className={`mt-1 text-[18px] font-light tracking-tight ${styles.text}`}>
            {clarity.label}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full border px-3 py-1.5 text-[12px] font-medium ${styles.badge}`}
        >
          {clarity.label}
        </span>
      </div>

      <ul className="space-y-2.5">
        {clarity.tips.map((tip) => (
          <li key={tip} className="text-[14px] leading-relaxed text-white/55">
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
