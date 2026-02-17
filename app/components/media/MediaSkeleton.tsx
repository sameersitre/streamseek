import { Skeleton } from "@/components/ui/skeleton";

interface MediaSkeletonProps {
  count?: number;
}

export default function MediaSkeleton({ count = 20 }: MediaSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="mx-auto">
          <Skeleton className="h-[270px] w-[170px] rounded-lg sm:h-[300px] sm:w-[190px]" />
        </div>
      ))}
    </div>
  );
}
