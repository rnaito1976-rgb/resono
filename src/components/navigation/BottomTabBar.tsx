"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Music2, UserRound } from "lucide-react";
import { useBandUnreadCount } from "@/hooks/useBandUnreadCount";
import { useUnreadCount } from "@/hooks/useUnreadCount";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  {
    href: "/messages",
    label: "Messages",
    icon: MessageCircle,
    badgeKey: "messages" as const,
  },
  { href: "/bands", label: "Bands", icon: Music2, badgeKey: "bands" as const },
  { href: "/me", label: "Profile", icon: UserRound },
] as const;

function TabBadge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground ring-2 ring-background/85">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function BottomTabBar() {
  const pathname = usePathname();
  const { count: messageCount } = useUnreadCount();
  const { count: bandCount } = useBandUnreadCount();
  const badgeCounts = {
    messages: messageCount,
    bands: bandCount,
  };

  return (
    <nav
      aria-label="Main navigation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
    >
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-background/85 px-4 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        {TABS.map(({ href, label, icon: Icon, ...rest }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          const badgeCount =
            "badgeKey" in rest ? badgeCounts[rest.badgeKey] : 0;

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className="relative flex h-11 w-11 items-center justify-center rounded-full transition-quiet active:scale-95"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-quiet ${
                  active ? "bg-white text-black" : "text-white/45"
                }`}
              >
                <Icon
                  className="h-[22px] w-[22px]"
                  strokeWidth={active ? 2.25 : 1.75}
                />
              </span>
              <TabBadge count={badgeCount} />
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
  return <div className="pb-[5.5rem]">{children}</div>;
}
