"use client";

import { useState } from "react";
import { MenuPageShell } from "@/components/menu/MenuPageShell";
import { Button } from "@/components/ui/button";
import { MENU_SUPPORT } from "@/lib/menu/copy";

export function SupportPageContent() {
  const [toast, setToast] = useState<string | null>(null);

  function handleCoffeeClick() {
    setToast(MENU_SUPPORT.coffeeToast);
    window.setTimeout(() => setToast(null), 3200);
  }

  return (
    <MenuPageShell title="Support Resono">
      <div className="space-y-8">
        <div className="rounded-[20px] border border-border/80 bg-subtle/80 px-6 py-8 backdrop-blur-sm">
          <p className="text-[17px] leading-[1.8] text-foreground/75">
            {MENU_SUPPORT.intro}
          </p>

          <p className="mt-8 text-[17px] leading-[1.8] text-foreground/75">
            {MENU_SUPPORT.usageIntro}
          </p>

          <ul className="mt-4 space-y-3">
            {MENU_SUPPORT.usageItems.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 text-[16px] text-foreground/80 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-primary/70 before:content-['']"
              >
                {item.label}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[17px] leading-[1.8] text-foreground/75">
            {MENU_SUPPORT.usageFooter}
          </p>
        </div>

        <Button size="lg" className="w-full" onClick={handleCoffeeClick}>
          {MENU_SUPPORT.coffeeButton}
        </Button>

        {toast ? (
          <p
            role="status"
            className="rounded-[14px] border border-border/80 bg-subtle/90 px-4 py-3 text-center text-[14px] leading-relaxed text-foreground/70"
          >
            {toast}
          </p>
        ) : null}
      </div>
    </MenuPageShell>
  );
}
