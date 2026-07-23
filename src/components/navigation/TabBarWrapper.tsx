"use client";

import { usePathname } from "next/navigation";
import {
  BottomTabBar,
  MainTabPadding,
  shouldShowBottomTabBar,
} from "@/components/navigation/BottomTabBar";

export function TabBarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showTabBar = shouldShowBottomTabBar(pathname);

  if (!showTabBar) {
    return <>{children}</>;
  }

  return (
    <>
      <MainTabPadding>{children}</MainTabPadding>
      <BottomTabBar />
    </>
  );
}
