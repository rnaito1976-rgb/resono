"use client";

import { useTransition } from "react";
import { MenuGroup } from "@/components/menu/MenuGroup";
import { MenuRow, MenuRowSeparator } from "@/components/menu/MenuRow";
import { useAuthUser } from "@/hooks/useAuthUser";
import { createClient } from "@/lib/supabase/client";

function MenuDivider() {
  return <div className="h-3" aria-hidden />;
}

function MenuLogoutRow() {
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/welcome";
    });
  }

  return (
    <MenuGroup>
      <MenuRow
        icon="🚪"
        label={isPending ? "Signing out…" : "Log Out"}
        onClick={handleSignOut}
        destructive
        showChevron={false}
      />
    </MenuGroup>
  );
}

export function MenuScreen() {
  const { isLoggedIn } = useAuthUser();

  return (
    <div className="space-y-3">
      <MenuGroup>
        <MenuRow href="/menu/about" icon="👋" label="About Resono" />
        <MenuRowSeparator />
        <MenuRow href="/menu/feedback" icon="💡" label="Feedback" />
        <MenuRowSeparator />
        <MenuRow href="/menu/support" icon="💚" label="Support Resono" />
      </MenuGroup>

      <MenuDivider />

      <MenuGroup>
        <MenuRow href="/menu/privacy" icon="🔒" label="Privacy Policy" />
        <MenuRowSeparator />
        <MenuRow href="/menu/terms" icon="📄" label="Terms of Service" />
      </MenuGroup>

      {isLoggedIn ? (
        <>
          <MenuDivider />
          <MenuLogoutRow />
        </>
      ) : null}
    </div>
  );
}
