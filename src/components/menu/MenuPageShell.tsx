import { AppTopBar } from "@/components/navigation/AppTopBar";

type MenuPageShellProps = {
  backHref?: string;
  backLabel?: string;
  title?: string;
  children: React.ReactNode;
};

export function MenuPageShell({
  backHref = "/menu",
  backLabel = "メニューに戻る",
  title,
  children,
}: MenuPageShellProps) {
  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <header className="px-5 pb-2 pt-6">
        <AppTopBar backHref={backHref} backLabel={backLabel} />
        {title ? (
          <h1 className="mt-4 text-[34px] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
        ) : null}
      </header>
      <div className="px-5 pb-12 pt-2">{children}</div>
    </main>
  );
}
