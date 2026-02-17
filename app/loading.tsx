import { MediaSkeleton } from "@/app/components/media";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <MediaSkeleton />
    </div>
  );
}
