/** Horizontal scrollable row of MediaCards with section title and arrow navigation. */
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import MediaCard from "@/app/components/media/MediaCard";
import ScrollArrows from "./ScrollArrows";
import { useHorizontalScroll } from "@/app/hooks/useHorizontalScroll";
import type { MediaItem } from "@/app/types";

interface MediaRowProps {
  title: string;
  items?: MediaItem[];
  isLoading: boolean;
  isError?: boolean;
}

export default function MediaRow({ title, items, isLoading, isError }: MediaRowProps) {
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useHorizontalScroll([items]);

  if (isError) return null;
  if (!isLoading && (!items || items.length === 0)) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-white sm:text-xl">{title}</h2>
      <div className="group/row relative">
        <ScrollArrows canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scroll} />

        <div
          ref={scrollRef}
          className="scrollbar-hide flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory"
        >
          {isLoading
            ? Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="shrink-0 snap-start">
                  <Skeleton className="h-[270px] w-[170px] rounded-lg sm:h-[300px] sm:w-[190px]" />
                </div>
              ))
            : items?.map((item) => (
                <div key={item.id} className="shrink-0 snap-start">
                  <MediaCard item={item} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
