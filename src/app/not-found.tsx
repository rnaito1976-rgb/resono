import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-mobile flex-col items-center justify-center gap-4 px-6">
      <p className="text-sm text-muted">メンバーが見つかりません</p>
      <Link
        href="/"
        className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
      >
        トップへ戻る
      </Link>
    </main>
  );
}
