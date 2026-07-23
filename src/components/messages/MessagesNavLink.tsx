"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useUnreadCount } from "@/hooks/useUnreadCount";

export function MessagesNavLink() {
  const { count } = useUnreadCount();

  return (
    <Link
      href="/messages"
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/5 hover:text-white active:bg-white/10"
      aria-label={count > 0 ? `メッセージ（未読${count}件）` : "メッセージ"}
    >
      <MessageCircle className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
