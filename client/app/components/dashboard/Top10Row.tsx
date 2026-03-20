/** Netflix-style "Top 10 Today" row with large outlined rank numbers beside posters. */
"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import MediaPoster from "@/app/components/media/MediaPoster";
import ScrollArrows from "./ScrollArrows";
import { useHorizontalScroll } from "@/app/hooks/useHorizontalScroll";
import type { MediaItem } from "@/app/types";

interface Top10RowProps {
  items?: MediaItem[];
  isLoading: boolean;
}

export default function Top10Row({ items, isLoading }: Top10RowProps) {
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useHorizontalScroll([items]);

  const slides = items?.slice(0, 10) ?? [];

  if (!isLoading && slides.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-white sm:text-xl">Top 10 Today</h2>
      <div className="group/row relative">
        <ScrollArrows canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scroll} />

        <div
          ref={scrollRef}
          className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory"
        >
          {isLoading
            ? Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="shrink-0 snap-start">
                  <Skeleton className="h-[200px] w-[260px] rounded-lg sm:h-[240px] sm:w-[300px]" />
                </div>
              ))
            : slides.map((item, index) => {
                const title = item.title || item.name || "Untitled";
                const mediaType = item.media_type || "movie";
                return (
                  <Link
                    key={item.id}
                    href={`/details/${mediaType}/${item.id}`}
                    className="group relative flex shrink-0 snap-start items-end"
                  >
                    <span className="top10-rank relative z-0 select-none text-[6rem] font-black leading-none sm:text-[8rem]">
                      {index + 1}
                    </span>
                    <div className="relative -ml-6 h-[180px] w-[120px] overflow-hidden rounded-md shadow-lg transition-transform duration-300 group-hover:scale-105 sm:-ml-8 sm:h-[220px] sm:w-[150px]">
                      <MediaPoster path={item.poster_path} alt={title} size="w300" fill />
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
