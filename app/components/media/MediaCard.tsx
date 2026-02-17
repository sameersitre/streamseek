"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import MediaPoster from "./MediaPoster";
import { GENRE_MAP } from "@/app/constants/genres";
import { formatYear } from "@/app/lib/formatDate";
import type { MediaItem } from "@/app/types";

interface MediaCardProps {
  item: MediaItem;
}

export default function MediaCard({ item }: MediaCardProps) {
  const title = item.title || item.name || "Untitled";
  const year = formatYear(item.release_date || item.first_air_date);
  const mediaType = item.media_type || "movie";
  const rating = item.vote_average?.toFixed(1);
  const genres = item.genre_ids
    ?.slice(0, 2)
    .map((id) => GENRE_MAP.get(id))
    .filter(Boolean);

  return (
    <Link href={`/details/${mediaType}/${item.id}`}>
      <Card className="group relative h-[270px] w-[170px] overflow-hidden border-transparent bg-zinc-900 transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:shadow-black/40 sm:h-[300px] sm:w-[190px]">
        {/* Poster */}
        <div className="relative h-full w-full">
          <MediaPoster path={item.poster_path} alt={title} size="w300" fill />
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
  );
}
