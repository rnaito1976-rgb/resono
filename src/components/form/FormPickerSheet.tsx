"use client";

import { useEffect, type ReactNode } from "react";

type FormPickerSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function FormPickerSheet({
  open,
  title,
  onClose,
  children,
}: FormPickerSheetProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end">
      <button
        type="button"
        aria-label="閉じる"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative mx-auto flex w-full max-w-mobile flex-col overflow-hidden rounded-t-[28px] bg-background shadow-2xl animate-in slide-in-from-bottom duration-200"
        style={{ height: "min(88dvh, 720px)" }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="text-[15px] text-muted transition-opacity active:opacity-70"
          >
            キャンセル
          </button>
          <h2 className="text-[16px] font-medium text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[15px] font-medium text-primary transition-opacity active:opacity-70"
          >
            完了
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
