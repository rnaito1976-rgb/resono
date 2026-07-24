import { PageBackLink } from "@/components/navigation/PageBackLink";

type AppTopBarProps = {
  backHref?: string;
  backLabel?: string;
  trailing?: React.ReactNode;
};

export function AppTopBar({ backHref, backLabel, trailing }: AppTopBarProps) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3">
      {backHref ? (
        <PageBackLink href={backHref} label={backLabel} />
      ) : (
        <span className="h-10 w-10 shrink-0" aria-hidden />
      )}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        {trailing}
      </div>
    </div>
  );
}
