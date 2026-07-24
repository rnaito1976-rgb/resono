import { MemberDetailSkeleton } from "@/components/skeletons/MemberDetailSkeleton";

/** ⑮ プロフィールページ遷移時の即時スケルトン */
export default function Loading() {
  return (
    <main className="mx-auto max-w-mobile bg-background">
      <MemberDetailSkeleton />
    </main>
  );
}
