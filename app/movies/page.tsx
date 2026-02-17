"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTrending } from "@/app/hooks/queries";
import { MediaGrid, MediaPagination, MediaSkeleton } from "@/app/components/media";

function MoviesContent() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const { data, isLoading, isError } = useTrending("movie", page);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold text-white">Movies</h1>
      <MediaGrid items={data?.results} isLoading={isLoading} isError={isError} />
      {data && <MediaPagination currentPage={page} totalPages={data.total_pages} />}
    </div>
  );
}

export default function Movies() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-10"><MediaSkeleton /></div>}>
      <MoviesContent />
    </Suspense>
  );
}
