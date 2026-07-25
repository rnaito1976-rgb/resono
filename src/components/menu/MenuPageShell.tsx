import { MenuCloseLink } from "@/components/menu/MenuCloseLink";

type MenuPageShellProps = {
  closeHref?: string;
  title?: string;
  children: React.ReactNode;
};

export function MenuPageShell({
  closeHref = "/menu",
  title,
  children,
}: MenuPageShellProps) {
  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <header className="px-5 pb-2 pt-6">
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
      </header>
      <div className="px-5 pb-12 pt-2">{children}</div>
    </main>
  );
}
