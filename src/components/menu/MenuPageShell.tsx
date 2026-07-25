import { AppPageHeader } from "@/components/navigation/AppPageHeader";
import { MenuCloseLink } from "@/components/menu/MenuCloseLink";

type MenuPageShellProps = {
  /** メニュー一覧: Close でホームへ。サブページ: 左矢印で /menu へ */
  variant?: "root" | "sub";
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function MenuPageShell({
  variant = "sub",
  title,
  subtitle,
  children,
}: MenuPageShellProps) {
  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <AppPageHeader
        backHref={variant === "sub" ? "/menu" : undefined}
        backLabel="メニューに戻る"
        eyebrow="Menu"
        title={title}
        subtitle={subtitle}
        actions={variant === "root" ? <MenuCloseLink href="/" /> : undefined}
      />
      <div className="px-5 pb-12">{children}</div>
    </main>
  );
}
