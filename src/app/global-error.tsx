"use client";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="ja">
      <body className="bg-black font-sans text-white antialiased">
        <main className="mx-auto flex min-h-dvh max-w-[390px] flex-col items-center justify-center gap-4 px-6">
          <p className="text-sm text-neutral-500">問題が発生しました</p>
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-[#1ed760] px-6 py-3 text-sm font-medium text-black"
          >
            再試行
          </button>
        </main>
      </body>
    </html>
  );
}
