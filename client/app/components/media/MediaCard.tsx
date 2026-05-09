"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid, faBookmark as faBookmarkSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline, faBookmark as faBookmarkOutline } from "@fortawesome/free-regular-svg-icons";
import MediaPoster from "./MediaPoster";
import { GENRE_MAP } from "@/app/constants/genres";
import { formatYear } from "@/app/lib/formatDate";
import { useUserInteractions, useToggleLike, useToggleWatchlist } from "@/app/hooks/queries";
import AuthDialog from "@/app/components/auth/AuthDialog";
import type { MediaItem, ContentMediaType } from "@/app/types";

interface MediaCardProps {
  item: MediaItem;
}

export default function MediaCard({ item }: MediaCardProps) {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const title = item.title || item.name || "Untitled";
  const year = formatYear(item.release_date || item.first_air_date);
  const mediaType = (item.media_type || "movie") as ContentMediaType;
  const rating = item.vote_average?.toFixed(1);
  const genres = item.genre_ids
    ?.slice(0, 2)
    .map((id) => GENRE_MAP.get(id))
    .filter(Boolean);

  const { isLiked, isWatchlisted, isAuthenticated } = useUserInteractions();
  const toggleLike = useToggleLike();
  const toggleWatchlist = useToggleWatchlist();

  const liked = isLiked(mediaType, item.id);
  const watchlisted = isWatchlisted(mediaType, item.id);

  const toggleParams = {
    mediaId: item.id,
    mediaType,
    title,
    posterPath: item.poster_path,
    voteAverage: item.vote_average,
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
      return;
    }
    toggleLike.mutate(toggleParams);
  };

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
      return;
    }
    toggleWatchlist.mutate(toggleParams);
  };

  return (
    <>
      <Link href={`/details/${mediaType}/${item.id}`}>
        <Card className="group relative h-[270px] w-[170px] gap-0 overflow-hidden border-transparent bg-zinc-900 p-0 transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:shadow-black/40 sm:h-[300px] sm:w-[190px]">
          {/* Poster */}
          <div className="relative h-full w-full">
            <MediaPoster path={item.poster_path} alt={title} size="w300" fill />
          </div>

          {/* Persistent status indicators (always visible when liked/watchlisted) */}
          {(liked || watchlisted) && (
            <div className="absolute top-2 left-2 z-10 flex gap-1.5">
              {liked && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                  <FontAwesomeIcon icon={faHeartSolid} className="h-3 w-3 text-red-400" />
                </span>
              )}
              {watchlisted && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                  <FontAwesomeIcon icon={faBookmarkSolid} className="h-3 w-3 text-accent" />
                </span>
              )}
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {/* Hover action buttons (top-right) */}
            <div className="absolute top-2 right-2 flex gap-1.5">
              <button
                onClick={handleLike}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                  liked
                    ? "bg-red-500/20 text-red-400"
                    : "bg-black/60 text-zinc-400 hover:text-white"
                }`}
                aria-label={liked ? "Unlike" : "Like"}
              >
                <FontAwesomeIcon
                  icon={liked ? faHeartSolid : faHeartOutline}
                  className="h-3.5 w-3.5"
                />
              </button>
              <button
                onClick={handleWatchlist}
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                  watchlisted
                    ? "bg-accent/20 text-accent"
                    : "bg-black/60 text-zinc-400 hover:text-white"
                }`}
                aria-label={watchlisted ? "Remove from watchlist" : "Add to watchlist"}
              >
                <FontAwesomeIcon
                  icon={watchlisted ? faBookmarkSolid : faBookmarkOutline}
                  className="h-3.5 w-3.5"
                />
              </button>
            </div>

            {/* Title */}
            <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-white">
              {title}
            </h3>

            {/* Rating + Year */}
            <div className="mb-1 flex items-center gap-2 text-xs text-zinc-300">
              {rating && Number(rating) > 0 && (
                <span className="font-medium text-accent">
                  ★ {rating}
                </span>
              )}
              {year && <span>{year}</span>}
            </div>

            {/* Genres */}
            {genres && genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {genres.map((name) => (
                  <span
                    key={name}
                    className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-zinc-300"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>
      </Link>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
}
