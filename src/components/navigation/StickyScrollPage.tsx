import type { ReactNode } from "react";
import { TAB_PAGE_HEIGHT } from "@/lib/navigation/tab-page-layout";

type StickyScrollPageProps = {
  sticky: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Sticky top chrome + scrollable body (subtitle and list scroll away). */
export function StickyScrollPage({ sticky, children, className }: StickyScrollPageProps) {
  return (
    <main
      className={`mx-auto flex max-w-mobile flex-col bg-background ${className ?? ""}`}
      style={{ height: TAB_PAGE_HEIGHT }}
    >
      <header className="sticky top-0 z-20 shrink-0 bg-background/90 backdrop-blur-xl">
        {sticky}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">{children}</div>
    </main>
  );
}

type StickyPageTitleProps = {
  eyebrow: string;
  title: string;
};

export function StickyPageTitle({ eyebrow, title }: StickyPageTitleProps) {
  return (
    <div className="px-5 pb-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
        {eyebrow}
      </p>
      <h1 className="mt-0.5 text-[20px] font-light tracking-tight">{title}</h1>
    </div>
  );
}

export function ScrollPageIntro({ children }: { children: ReactNode }) {
  return (
    <p className="px-5 pb-4 pt-2 text-[15px] leading-relaxed text-muted">{children}</p>
  );
}
