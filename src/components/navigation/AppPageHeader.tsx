import { AppTopBar } from "@/components/navigation/AppTopBar";

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
  const showTopBar = Boolean(backHref || actions);

  return (
    <header className="px-5 pb-4 pt-6">
      {showTopBar ? (
        <AppTopBar backHref={backHref} backLabel={backLabel} trailing={actions} />
      ) : null}

      <div className={showTopBar ? "mt-4" : undefined}>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-[28px] font-light tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-[15px] leading-relaxed text-white/45">{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
}
