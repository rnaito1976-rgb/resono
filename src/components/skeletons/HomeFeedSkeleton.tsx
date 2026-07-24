import { PersonCardSkeleton } from "@/components/skeletons/PersonCardSkeleton";

type HomeFeedSkeletonProps = {
  count?: number;
};

export function HomeFeedSkeleton({ count = 3 }: HomeFeedSkeletonProps) {
  return (
    <div className="flex flex-col gap-14">
      {Array.from({ length: count }, (_, index) => (
        <PersonCardSkeleton key={index} />
      ))}
    </div>
  );
}
