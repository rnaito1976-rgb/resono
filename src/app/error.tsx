"use client";

import { useEffect } from "react";
import Link from "next/link";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-mobile flex-col items-center justify-center gap-4 px-6">
      <p className="text-sm text-muted">問題が発生しました</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-black"
        >
          再試行
        </button>
        <Link
          href="/"
          className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white"
        >
          トップへ
        </Link>
      </div>
    </main>
  );
}
