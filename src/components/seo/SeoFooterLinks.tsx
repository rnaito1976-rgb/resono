import Link from "next/link";

const LINKS = [
  { href: "/", label: "トップ" },
  { href: "/about", label: "RESONOとは" },
  { href: "/members", label: "バンドメンバー募集" },
  { href: "/support", label: "RESONOを応援する" },
] as const;

export function SeoFooterLinks() {
  return (
    <nav
      aria-label="サイト内リンク"
      className="border-t border-border/60 pt-8"
    >
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[14px] text-white/45 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
