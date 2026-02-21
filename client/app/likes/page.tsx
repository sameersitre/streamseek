"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useUserLikes } from "@/app/hooks/queries";
import { MediaPagination, MediaSkeleton } from "@/app/components/media";
import MediaPoster from "@/app/components/media/MediaPoster";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

function LikesContent() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const { data, isLoading } = useUserLikes(page);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <FontAwesomeIcon icon={faHeart} className="h-12 w-12 text-zinc-600" />
        <p className="text-lg text-zinc-400">Sign in to view your likes</p>
        <p className="text-sm text-zinc-600">
          Like movies and TV shows to save them here.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <MediaSkeleton />;
  }

  if (!data?.results || data.results.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <FontAwesomeIcon icon={faHeart} className="h-12 w-12 text-zinc-600" />
        <p className="text-lg text-zinc-400">No liked items yet</p>
        <p className="text-sm text-zinc-600">
          Browse and like movies and TV shows!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {data.results.map((item) => (
          <Link key={`${item.mediaType}-${item.mediaId}`} href={`/details/${item.mediaType}/${item.mediaId}`}>
            <div className="group relative h-[270px] w-[170px] overflow-hidden rounded-lg bg-zinc-900 transition-transform duration-300 hover:scale-105 sm:h-[300px] sm:w-[190px]">
              <MediaPoster path={item.posterPath} alt={item.title} size="w300" fill />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-white">
                  {item.title}
                </h3>
                {item.voteAverage > 0 && (
                  <span className="text-xs font-medium text-accent">
                    ★ {item.voteAverage.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      {data.totalPages > 1 && (
        <MediaPagination currentPage={page} totalPages={data.totalPages} />
      )}
    </>
  );
}

export default function Likes() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold text-white">Likes</h1>
      <Suspense fallback={<div><MediaSkeleton /></div>}>
        <LikesContent />
      </Suspense>
    </div>
  );
}
