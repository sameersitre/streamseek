"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useFilter } from "@/app/hooks/queries";
import { MediaGrid, MediaPagination, MediaSkeleton } from "@/app/components/media";
import { GENRE_MAP } from "@/app/constants/genres";

function FilterContent() {
  const searchParams = useSearchParams();
  const genres = searchParams.get("genres") || "";
  const page = Number(searchParams.get("page")) || 1;
  const { data, isLoading, isError } = useFilter(genres, page);

  const genreNames = genres
    .split(",")
    .map((id) => GENRE_MAP.get(Number(id)))
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-2 text-3xl font-bold text-white">Filter</h1>
      {genreNames && (
        <p className="mb-6 text-sm text-zinc-400">
          Genres: {genreNames}
        </p>
      )}
      {!genres ? (
        <p className="text-zinc-400">Select genres from the filter icon in the navigation bar.</p>
      ) : (
        <>
          <MediaGrid items={data?.results} isLoading={isLoading} isError={isError} />
          {data && <MediaPagination currentPage={page} totalPages={data.total_pages} />}
        </>
      )}
    </div>
  );
}

export default function Filter() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-10"><MediaSkeleton /></div>}>
      <FilterContent />
    </Suspense>
  );
}
