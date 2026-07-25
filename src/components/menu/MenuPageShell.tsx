import { MenuCloseLink } from "@/components/menu/MenuCloseLink";

type MenuPageShellProps = {
  closeHref?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function MenuPageShell({
  closeHref = "/menu",
  title,
  subtitle,
  children,
}: MenuPageShellProps) {
  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <header className="px-5 pb-4 pt-6">
        <div className="flex items-start justify-between gap-4">
          {title ? (
            <h1 className="min-w-0 text-[34px] font-semibold tracking-tight text-foreground">
              {title}
            </h1>
          ) : (
            <span className="min-w-0 flex-1" aria-hidden />
          )}
          <MenuCloseLink href={closeHref} />
        </div>
        {subtitle ? (
          <p className="mt-4 whitespace-pre-line text-[17px] leading-[1.75] text-foreground/55">
            {subtitle}
          </p>
        ) : null}
      </header>
      <div className="px-5 pb-12 pt-2">{children}</div>
    </main>
  );
}
