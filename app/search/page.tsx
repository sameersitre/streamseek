"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSearch } from "@/app/hooks/queries";
import { MediaGrid, MediaPagination, MediaSkeleton } from "@/app/components/media";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const page = Number(searchParams.get("page")) || 1;
  const { data, isLoading } = useSearch(query, page);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold text-white">
        {query ? `Results for "${query}"` : "Search"}
      </h1>
      {!query ? (
        <p className="text-zinc-400">Type something in the search bar to find movies and TV shows.</p>
      ) : (
        <>
          <MediaGrid items={data?.results} isLoading={isLoading} />
          {data && <MediaPagination currentPage={page} totalPages={data.total_pages} />}
        </>
      )}
    </div>
  );
}

export default function Search() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-10"><MediaSkeleton /></div>}>
      <SearchContent />
    </Suspense>
  );
}
