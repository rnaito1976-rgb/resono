import type { ReactNode } from "react";

type MusicPageSectionProps = {
  title: string;
  description?: string;
  resonancePoints?: string[];
  children: ReactNode;
};

function SectionResonancePoints({ points }: { points: string[] }) {
  if (points.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[16px] bg-[var(--frequency-color-soft)] px-4 py-3">
      <p className="text-[12px] font-medium tracking-[0.12em] text-[var(--frequency-color)]">
        共鳴するポイント
      </p>
      <ul className="mt-2 space-y-1">
        {points.map((point) => (
          <li key={point} className="text-[14px] text-foreground/80">
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MusicPageSection({
  title,
  description,
  resonancePoints,
  children,
}: MusicPageSectionProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-[20px] font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="text-[14px] leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {resonancePoints ? <SectionResonancePoints points={resonancePoints} /> : null}
      {children}
    </section>
  );
}

export function MusicEmptyHint({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[18px] bg-subtle/50 px-4 py-5 text-[15px] leading-relaxed text-muted">
      {children}
    </p>
  );
}

export function MusicResonanceSummary({ points }: { points: string[] }) {
  if (points.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-[20px] font-semibold tracking-tight text-foreground">
          共鳴するポイント
        </h2>
      </div>
      <div className="rounded-[22px] bg-[var(--frequency-color-soft)] px-5 py-5">
        <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-[var(--frequency-color)]">
          あなたと共通
        </p>
        <ul className="mt-3 space-y-2">
          {points.map((point) => (
            <li key={point} className="text-[15px] text-foreground/85">
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
