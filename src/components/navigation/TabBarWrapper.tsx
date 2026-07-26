"use client";

import { usePathname } from "next/navigation";
import {
  BottomTabBar,
  MainTabPadding,
  shouldShowBottomTabBar,
} from "@/components/navigation/BottomTabBar";

const TAB_PAGE_ROUTES = new Set(["/messages", "/bands", "/me"]);

export function TabBarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showTabBar = shouldShowBottomTabBar(pathname);
  const usesTabPageHeight =
    TAB_PAGE_ROUTES.has(pathname) || pathname.startsWith("/bands/");

  if (!showTabBar) {
    return <>{children}</>;
  }

  if (usesTabPageHeight) {
    return (
      <>
        {children}
        <BottomTabBar />
      </>
    );
  }

  return (
    <>
      <MainTabPadding>{children}</MainTabPadding>
      <BottomTabBar />
    </>
  );
}
