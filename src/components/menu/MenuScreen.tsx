"use client";

import { useTransition } from "react";
import { MenuGroup } from "@/components/menu/MenuGroup";
import { MenuRow } from "@/components/menu/MenuRow";
import { useAuthUser } from "@/hooks/useAuthUser";
import { SUPPORT_COPY } from "@/lib/support/copy";
import { MENU_DELETE_ACCOUNT } from "@/lib/menu/copy";
import { createClient } from "@/lib/supabase/client";

function MenuSectionGap() {
  return <div className="h-8" aria-hidden />;
}

function MenuDivider() {
  return (
    <div className="py-5" aria-hidden>
      <div className="h-px bg-border/70" />
    </div>
  );
}

function MenuLogoutRow() {
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    });
  }

  return (
    <MenuRow
      label={isPending ? "Signing out…" : "Log Out"}
      onClick={handleSignOut}
      destructive
    />
  );
}

export function MenuScreen() {
  const { isLoggedIn } = useAuthUser();

  return (
    <div>
      <MenuGroup>
        <MenuRow href="/about" label="About Resono" />
        <MenuRow href="/menu/feedback" label="Feedback" />
        {isLoggedIn ? (
          <MenuRow href="/menu/notifications" label="Notification" />
        ) : null}
      </MenuGroup>

      <MenuDivider />

      <MenuGroup>
        <MenuRow
          href="/support"
          label={SUPPORT_COPY.menuLabel}
          accent
        />
      </MenuGroup>

      <MenuDivider />

      <MenuGroup>
        <MenuRow href="/menu/privacy" label="Privacy Policy" />
        <MenuRow href="/menu/terms" label="Terms of Use" />
      </MenuGroup>

      {isLoggedIn ? (
        <>
          <MenuSectionGap />
          <MenuGroup>
            <MenuLogoutRow />
            <MenuRow
              href="/menu/delete-account"
              label={MENU_DELETE_ACCOUNT.menuLabel}
              destructive
            />
          </MenuGroup>
        </>
      ) : null}
    </div>
  );
}
