"use client";

import { useOptimistic, useTransition } from "react";
import { MenuPageShell } from "@/components/menu/MenuPageShell";
import { updateEmailNotificationPreferenceAction } from "@/lib/actions/email-notifications";
import { cn } from "@/lib/utils";
import {
  EMAIL_NOTIFICATION_ITEMS,
  type EmailNotificationPreferenceKey,
  type EmailNotificationPreferences,
} from "@/types/email-notifications";

type EmailNotificationSettingsProps = {
  initialPreferences: EmailNotificationPreferences;
};

function NotificationToggle({
  enabled,
  disabled,
  onToggle,
  title,
  description,
}: {
  enabled: boolean;
  disabled: boolean;
  onToggle: () => void;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[14px] border border-border/80 bg-subtle/60 px-4 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-medium tracking-tight text-foreground">{title}</p>
        <p className="mt-1 text-[14px] leading-relaxed text-foreground/55">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          "relative mt-0.5 h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-300",
          enabled ? "bg-primary" : "bg-foreground/20",
          disabled && "opacity-50"
        )}
      >
        <span
          className={cn(
            "absolute top-[2px] left-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-sm transition-transform duration-300",
            enabled && "translate-x-[20px]"
          )}
        />
      </button>
    </div>
  );
}

export function EmailNotificationSettings({ initialPreferences }: EmailNotificationSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticPrefs, setOptimisticPrefs] = useOptimistic(initialPreferences);

  function handleToggle(key: EmailNotificationPreferenceKey) {
    const nextEnabled = !optimisticPrefs[key];

    startTransition(async () => {
      setOptimisticPrefs({ ...optimisticPrefs, [key]: nextEnabled });
      const result = await updateEmailNotificationPreferenceAction(key, nextEnabled);
      if ("error" in result) {
        setOptimisticPrefs(initialPreferences);
      }
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-[15px] leading-relaxed text-foreground/55">
        出会いに関するメール通知のみ。すべてデフォルトでオンです。
      </p>
      {EMAIL_NOTIFICATION_ITEMS.map((item) => (
        <NotificationToggle
          key={item.key}
          title={item.title}
          description={item.description}
          enabled={optimisticPrefs[item.key]}
          disabled={isPending}
          onToggle={() => handleToggle(item.key)}
        />
      ))}
    </div>
  );
}

export function EmailNotificationSettingsPage({
  preferences,
}: {
  preferences: EmailNotificationPreferences;
}) {
  return (
    <MenuPageShell title="メール通知" subtitle="出会いに関する通知">
      <EmailNotificationSettings initialPreferences={preferences} />
    </MenuPageShell>
  );
}
