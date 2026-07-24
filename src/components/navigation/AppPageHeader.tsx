import { PageBackLink } from "@/components/navigation/PageBackLink";

type AppPageHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
};

export function AppPageHeader({
  eyebrow,
  title,
  subtitle,
  backHref,
  backLabel,
  actions,
}: AppPageHeaderProps) {
  const hasBack = Boolean(backHref);

  return (
    <header className={`px-5 pb-4 ${hasBack ? "pt-6" : "pt-10"}`}>
      <div className={hasBack ? "flex items-start gap-3" : undefined}>
        {hasBack ? <PageBackLink href={backHref!} label={backLabel} /> : null}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
            {eyebrow}
          </p>
          <div
            className={`${hasBack ? "mt-1" : "mt-3"} flex items-end justify-between gap-4`}
          >
            <div className="min-w-0">
              <h1
                className={`font-light tracking-tight ${
                  hasBack ? "truncate text-[22px]" : "text-[28px]"
                }`}
              >
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 text-[15px] leading-relaxed text-white/45">{subtitle}</p>
              ) : null}
            </div>
            {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
          </div>
        </div>
      </div>
    </header>
  );
}
