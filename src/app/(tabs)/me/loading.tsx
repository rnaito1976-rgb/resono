import { MemberDetailSkeleton } from "@/components/skeletons/MemberDetailSkeleton";

export default function MyPageLoading() {
  return (
    <main className="mx-auto max-w-mobile bg-background">
      <MemberDetailSkeleton />
    </main>
  );
}
