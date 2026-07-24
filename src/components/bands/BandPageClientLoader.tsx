import dynamic from "next/dynamic";
import { MemberDetailSkeleton } from "@/components/skeletons/MemberDetailSkeleton";

/** ⑦ Dynamic Import: Band詳細の重いクライアントJSをルート分割 */
const BandPageClient = dynamic(
  () =>
    import("@/components/bands/BandPageClient").then((module) => ({
      default: module.BandPageClient,
    })),
  {
    loading: () => (
      <main className="mx-auto min-h-dvh max-w-mobile bg-background">
        <MemberDetailSkeleton variant="sheet" />
      </main>
    ),
  }
);

export { BandPageClient };
