"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Music2, UserRound } from "lucide-react";
import { useUnreadCount } from "@/hooks/useUnreadCount";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageCircle, badge: true },
  { href: "/bands", label: "Bands", icon: Music2 },
  { href: "/me", label: "Profile", icon: UserRound },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();
  const { count } = useUnreadCount();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/8 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto grid max-w-mobile grid-cols-4 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        {TABS.map(({ href, label, icon: Icon, ...rest }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          const showBadge = "badge" in rest && rest.badge && count > 0;

          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] transition-quiet ${
                active ? "text-white" : "text-white/40"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
              <span>{label}</span>
              {showBadge ? (
                <span className="absolute right-3 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {count > 99 ? "99+" : count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function shouldShowBottomTabBar(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/messages" ||
    pathname === "/bands" ||
    pathname === "/me"
  );
}

export function MainTabPadding({ children }: { children: React.ReactNode }) {
  return <div className="pb-24">{children}</div>;
}
