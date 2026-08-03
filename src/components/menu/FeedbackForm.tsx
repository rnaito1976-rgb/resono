"use client";

import { useState, useTransition } from "react";
import { MenuPageShell } from "@/components/menu/MenuPageShell";
import { Button } from "@/components/ui/button";
import { submitFeedbackAction } from "@/lib/actions/feedback";
import type { FeedbackCategory } from "@/lib/feedback/send-feedback-email";
import { MENU_FEEDBACK } from "@/lib/menu/copy";
import { cn } from "@/lib/utils";

export function FeedbackForm() {
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!category || !message.trim()) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await submitFeedbackAction({ category, message });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }

      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="rounded-[20px] border border-border/80 bg-subtle/80 px-6 py-10 text-center backdrop-blur-sm">
        <p className="text-[20px] font-semibold tracking-tight text-foreground">
          {MENU_FEEDBACK.successTitle}
        </p>
        <p className="mt-4 text-[16px] leading-[1.75] text-foreground/60">
          {MENU_FEEDBACK.successBody}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {MENU_FEEDBACK.categories.map((item) => {
          const selected = category === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={cn(
                "flex w-full items-center rounded-[14px] border px-4 py-4 text-left text-[16px] transition-quiet",
                selected
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-border/80 bg-subtle/60 text-foreground/80 active:bg-white/[0.04]"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={MENU_FEEDBACK.placeholder}
          rows={6}
          disabled={!category || isPending}
          className="w-full resize-none rounded-[14px] border border-border/80 bg-subtle/60 px-4 py-4 text-[16px] leading-relaxed text-foreground placeholder:text-muted focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-45"
        />
        {error ? (
          <p className="text-[13px] text-red-300" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!category || !message.trim() || isPending}
        >
          {isPending ? "送信中…" : MENU_FEEDBACK.submit}
        </Button>
      </form>
    </div>
  );
}

export function FeedbackPageContent() {
  return (
    <MenuPageShell title="Feedback">
      <FeedbackForm />
    </MenuPageShell>
  );
}
