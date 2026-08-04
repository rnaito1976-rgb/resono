"use client";

import { useState, useTransition } from "react";
import { MenuPageShell } from "@/components/menu/MenuPageShell";
import { Button } from "@/components/ui/button";
import { deleteAccountAction } from "@/lib/actions/account";
import { MENU_DELETE_ACCOUNT } from "@/lib/menu/copy";
import { cn } from "@/lib/utils";

function DeleteAccountForm() {
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!confirmed) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteAccountAction();
      if (result && "error" in result && result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-[20px] border border-border/80 bg-subtle/80 px-6 py-8 backdrop-blur-sm">
        <div className="space-y-4">
          {MENU_DELETE_ACCOUNT.intro.map((paragraph) => (
            <p
              key={paragraph}
              className="text-[16px] leading-[1.8] text-foreground/75"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <ul className="mt-6 space-y-3">
          {MENU_DELETE_ACCOUNT.removedItems.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 text-[15px] text-foreground/70 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-red-400/70 before:content-['']"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <label className="flex items-start gap-3 rounded-[16px] border border-border/80 bg-subtle/60 px-4 py-4">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => {
            setConfirmed(event.target.checked);
            setError(null);
          }}
          className="mt-1 h-4 w-4 shrink-0 accent-primary"
        />
        <span className="text-[15px] leading-relaxed text-foreground/75">
          {MENU_DELETE_ACCOUNT.confirmLabel}
        </span>
      </label>

      <Button
        type="submit"
        size="lg"
        className="w-full bg-red-500/90 text-white hover:bg-red-500"
        disabled={!confirmed || isPending}
      >
        {isPending ? MENU_DELETE_ACCOUNT.submitting : MENU_DELETE_ACCOUNT.submit}
      </Button>

      {error ? (
        <p
          role="alert"
          className={cn(
            "rounded-[14px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-center",
            "text-[14px] leading-relaxed text-red-300"
          )}
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}

export function DeleteAccountPageContent() {
  return (
    <MenuPageShell title={MENU_DELETE_ACCOUNT.title}>
      <DeleteAccountForm />
    </MenuPageShell>
  );
}
