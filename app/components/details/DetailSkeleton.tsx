import { Skeleton } from "@/components/ui/skeleton";

export default function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Poster + Header */}
      <div className="flex gap-6">
        <Skeleton className="h-[240px] w-[160px] shrink-0 rounded-lg" />
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="mt-6 space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Cast row */}
      <div className="mt-6">
        <Skeleton className="mb-3 h-5 w-16" />
        <div className="flex gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-[195px] w-[130px] shrink-0 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
