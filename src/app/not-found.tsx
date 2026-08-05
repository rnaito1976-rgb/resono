import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "ページが見つかりません",
  description: "お探しのページは見つかりませんでした。RESONOのトップページからバンドメンバー募集をご覧ください。",
  path: "/404",
  robots: {
    index: false,
    follow: true,
  },
});

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-mobile flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-3">
        <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-white/45">
          404
        </p>
        <h1 className="text-[24px] font-light tracking-tight text-foreground">
          ページが見つかりません
        </h1>
        <p className="text-[15px] leading-relaxed text-white/55">
          リンクが無効か、ページが移動した可能性があります。
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/"
          className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
        >
          トップへ戻る
        </Link>
        <Link
          href="/members"
          className="rounded-full border border-border px-6 py-3 text-sm text-white/70"
        >
          バンドメンバー募集を見る
        </Link>
      </div>
    </main>
  );
}
