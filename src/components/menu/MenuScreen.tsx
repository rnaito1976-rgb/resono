"use client";

import { useTransition } from "react";
import { MenuGroup } from "@/components/menu/MenuGroup";
import { MenuRow } from "@/components/menu/MenuRow";
import { useAuthUser } from "@/hooks/useAuthUser";
import { createClient } from "@/lib/supabase/client";

function MenuSectionGap() {
  return <div className="h-8" aria-hidden />;
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
        <MenuRow href="/menu/about" label="About Resono" />
        <MenuRow href="/menu/feedback" label="Feedback" />
      </MenuGroup>

      <MenuSectionGap />

      <MenuGroup>
        <MenuRow href="/menu/privacy" label="Privacy Policy" />
        <MenuRow href="/menu/terms" label="Terms of Use" />
      </MenuGroup>

      {isLoggedIn ? (
        <>
          <MenuSectionGap />
          <MenuGroup>
            <MenuLogoutRow />
          </MenuGroup>
        </>
      ) : null}
    </div>
  );
}
