import MediaCard from "./MediaCard";
import MediaSkeleton from "./MediaSkeleton";
import type { MediaItem } from "@/app/types";

interface MediaGridProps {
  items: MediaItem[] | undefined;
  isLoading: boolean;
}

export default function MediaGrid({ items, isLoading }: MediaGridProps) {
  if (isLoading) {
    return <MediaSkeleton />;
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">No results found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  );
}
