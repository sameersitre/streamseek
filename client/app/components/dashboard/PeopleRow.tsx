/** Horizontal scrollable row of trending people with circular profile photos. */
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import PeopleCard from "./PeopleCard";
import ScrollArrows from "./ScrollArrows";
import { useHorizontalScroll } from "@/app/hooks/useHorizontalScroll";
import type { PersonItem } from "@/app/types";

interface PeopleRowProps {
  items?: PersonItem[];
  isLoading: boolean;
  isError?: boolean;
}

export default function PeopleRow({ items, isLoading, isError }: PeopleRowProps) {
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useHorizontalScroll([items]);

  if (isError) return null;
  if (!isLoading && (!items || items.length === 0)) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-white sm:text-xl">Trending Stars</h2>
      <div className="group/row relative">
        <ScrollArrows canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scroll} />

        <div
          ref={scrollRef}
          className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2"
        >
          {isLoading
            ? Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="flex shrink-0 snap-start flex-col items-center gap-2">
                  <Skeleton className="h-[130px] w-[130px] rounded-full sm:h-[150px] sm:w-[150px]" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))
            : items?.map((person) => (
                <div key={person.id} className="shrink-0 snap-start">
                  <PeopleCard person={person} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
