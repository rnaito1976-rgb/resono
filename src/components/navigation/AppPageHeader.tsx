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
  if (backHref) {
    return (
      <header className="px-5 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <PageBackLink href={backHref} label={backLabel} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
              {eyebrow}
            </p>
            <h1 className="truncate text-[22px] font-light tracking-tight">{title}</h1>
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
      </header>
    );
  }

  return (
    <header className="px-5 pb-4 pt-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
        {eyebrow}
      </p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] font-light tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-[15px] leading-relaxed text-white/45">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
