import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div>
      {/* Hero skeleton */}
      <Skeleton className="h-[50vh] w-full rounded-none sm:h-[60vh] md:h-[70vh]" />

      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-6 pt-6">
        {/* Filter bar skeleton */}
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>

        {/* Row skeletons */}
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="mb-8">
            <Skeleton className="mb-3 h-6 w-48" />
            <div className="flex gap-3">
              {Array.from({ length: 8 }, (_, j) => (
                <Skeleton
                  key={j}
                  className="h-[270px] w-[170px] shrink-0 rounded-lg sm:h-[300px] sm:w-[190px]"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
