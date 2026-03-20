/** Full-width hero carousel with auto-rotating backdrop images from trending media. */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { backdropUrl } from "@/app/lib/tmdb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Skeleton } from "@/components/ui/skeleton";
import type { MediaItem } from "@/app/types";

interface HeroCarouselProps {
  items?: MediaItem[];
  isLoading: boolean;
}

export default function HeroCarousel({ items, isLoading }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Memoize to avoid re-filtering on every render (items reference is stable from TanStack Query)
  const slides = useMemo(
    () => items?.filter((item) => item.backdrop_path)?.slice(0, 8) ?? [],
    [items]
  );

  const next = useCallback(() => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length === 0) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [isPaused, next, slides.length]);

  if (isLoading || slides.length === 0) {
    return (
      <div className="relative h-[50vh] w-full sm:h-[60vh] md:h-[70vh]">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
    );
  }

  const slide = slides[current];
  const title = slide.title || slide.name || "Untitled";
  const mediaType = slide.media_type || "movie";

  return (
    <div
      className="relative h-[50vh] w-full overflow-hidden sm:h-[60vh] md:h-[70vh]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Trending media"
    >
      {/* Backdrop image */}
      <Image
        src={backdropUrl(slide.backdrop_path)}
        alt={title}
        fill
        className="object-cover object-top"
        sizes="100vw"
        priority={current === 0}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-end">
        <div className="mx-auto w-full max-w-7xl px-6 pb-16 sm:pb-20">
          <h2 className="mb-2 max-w-2xl text-2xl font-bold text-white sm:text-3xl md:text-5xl">
            {title}
          </h2>

          <div className="mb-3 flex items-center gap-3 text-sm text-zinc-300">
            {slide.vote_average > 0 && (
              <span className="font-semibold text-accent">
                ★ {slide.vote_average.toFixed(1)}
              </span>
            )}
            {(slide.release_date || slide.first_air_date) && (
              <span>{(slide.release_date || slide.first_air_date)?.slice(0, 4)}</span>
            )}
            {slide.media_type && (
              <span className="rounded bg-white/10 px-2 py-0.5 text-xs uppercase">
                {slide.media_type}
              </span>
            )}
          </div>

          {slide.overview && (
            <p className="mb-4 line-clamp-2 max-w-xl text-sm text-zinc-300 sm:text-base">
              {slide.overview}
            </p>
          )}

          <Link
            href={`/details/${mediaType}/${slide.id}`}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/80"
          >
            <FontAwesomeIcon icon={faCircleInfo} className="h-4 w-4" />
            More Info
          </Link>
        </div>
      </div>

      {/* Left/Right arrows */}
      <button
        onClick={prev}
        className="absolute top-1/2 left-4 hidden -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/80 md:block"
        aria-label="Previous slide"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute top-1/2 right-4 hidden -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/80 md:block"
        aria-label="Next slide"
      >
        <FontAwesomeIcon icon={faChevronRight} className="h-5 w-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${
              i === current ? "w-6 bg-accent" : "w-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
