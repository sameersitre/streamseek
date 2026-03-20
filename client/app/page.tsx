/** Netflix-style dashboard — hero carousel, filter tabs, horizontal content rows, lazy genre rows. */
"use client";

import { useState, Suspense } from "react";
import {
  useTrending,
  usePopular,
  useTopRated,
  useNowPlaying,
  useAiringToday,
  useOnTheAir,
  useTrendingPeople,
  useUpcoming,
} from "@/app/hooks/queries";
import {
  HeroCarousel,
  MediaRow,
  Top10Row,
  PeopleRow,
  DashboardFilterBar,
  GenreRow,
  DashboardSkeleton,
} from "@/app/components/dashboard";
import { GENRE_MAP } from "@/app/constants/genres";
import type { DashboardFilter } from "@/app/components/dashboard";
import type { UseQueryResult } from "@tanstack/react-query";
import type { PaginatedResponse, MediaItem } from "@/app/types";

// --- Constants ---

const DASHBOARD_GENRES = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 27, name: "Horror" },
  { id: 878, name: "Science Fiction" },
  { id: 10749, name: "Romance" },
  { id: 99, name: "Documentary" },
];

/** Row config: maps each content row to its filter category and query result. */
interface RowConfig {
  title: string;
  category: "movies" | "tv";
  query: UseQueryResult<PaginatedResponse<MediaItem>>;
}

function DashboardContent() {
  const [activeFilter, setActiveFilter] = useState<DashboardFilter>("all");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  // --- Data fetching ---
  const trending = useTrending("all", 1);
  const popularMovies = usePopular("movie", 1);
  const popularTV = usePopular("tv", 1);
  const nowPlaying = useNowPlaying(1);
  const upcoming = useUpcoming(1);
  const airingToday = useAiringToday(1);
  const onTheAir = useOnTheAir(1);
  const topRatedMovies = useTopRated("movie", 1);
  const topRatedTV = useTopRated("tv", 1);
  const trendingPeople = useTrendingPeople(1);

  // --- Row configuration (data-driven to avoid repetitive JSX) ---
  const rows: RowConfig[] = [
    { title: "Popular Movies", category: "movies", query: popularMovies },
    { title: "Popular TV Shows", category: "tv", query: popularTV },
    { title: "Now Playing in Theaters", category: "movies", query: nowPlaying },
    { title: "Upcoming Movies", category: "movies", query: upcoming },
    { title: "Airing Today", category: "tv", query: airingToday },
    { title: "Coming This Week", category: "tv", query: onTheAir },
    { title: "Top Rated Movies", category: "movies", query: topRatedMovies },
    { title: "Top Rated TV Shows", category: "tv", query: topRatedTV },
  ];

  // --- Derived visibility state ---
  const isCategoryVisible = (category: "movies" | "tv") =>
    activeFilter === "all" || activeFilter === category;
  const showPeople = activeFilter === "all" || activeFilter === "people";
  const showGenres = !selectedGenre && (activeFilter === "all" || activeFilter === "movies");

  const genreRows = selectedGenre
    ? [{ id: selectedGenre, name: GENRE_MAP.get(selectedGenre) ?? "Selected Genre" }]
    : DASHBOARD_GENRES;

  return (
    <div className="-mt-20">
      <HeroCarousel items={trending.data?.results} isLoading={trending.isLoading} />

      <div className="mx-auto max-w-7xl px-6">
        <DashboardFilterBar
          active={activeFilter}
          onChange={setActiveFilter}
          selectedGenre={selectedGenre}
          onGenreChange={setSelectedGenre}
        />

        {!selectedGenre && (
          <Top10Row items={trending.data?.results} isLoading={trending.isLoading} />
        )}

        {/* Content rows — rendered from config, filtered by active tab */}
        {!selectedGenre &&
          rows.map(
            ({ title, category, query }) =>
              isCategoryVisible(category) && (
                <MediaRow
                  key={title}
                  title={title}
                  items={query.data?.results}
                  isLoading={query.isLoading}
                  isError={query.isError}
                />
              )
          )}

        {showPeople && !selectedGenre && (
          <PeopleRow
            items={trendingPeople.data?.results}
            isLoading={trendingPeople.isLoading}
            isError={trendingPeople.isError}
          />
        )}

        {(showGenres || selectedGenre) &&
          genreRows.map((g) => (
            <GenreRow key={g.id} genreId={g.id} genreName={g.name} />
          ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
