import { HomeFeedSkeleton } from "@/components/skeletons/HomeFeedSkeleton";

/** Route transition: feed area only (header + own card come from the page). */
export default function Loading() {
  return (
    <div className="px-5 pb-20 pt-6">
      <HomeFeedSkeleton count={2} />
    </div>
  );
}
