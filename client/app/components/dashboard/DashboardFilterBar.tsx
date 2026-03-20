/** Filter pill bar for dashboard — All, Movies, TV Shows, People, and Categories genre dropdown. */
"use client";

import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { GENRES, GENRE_MAP } from "@/app/constants/genres";

export type DashboardFilter = "all" | "movies" | "tv" | "people";

interface DashboardFilterBarProps {
  active: DashboardFilter;
  onChange: (filter: DashboardFilter) => void;
  selectedGenre: number | null;
  onGenreChange: (genreId: number | null) => void;
}

const filters: { key: DashboardFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "movies", label: "Movies" },
  { key: "tv", label: "TV Shows" },
  { key: "people", label: "People" },
];

export default function DashboardFilterBar({
  active,
  onChange,
  selectedGenre,
  onGenreChange,
}: DashboardFilterBarProps) {
  const [genreOpen, setGenreOpen] = useState(false);
  const genreRef = useRef<HTMLDivElement>(null);

  // Close genre dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) {
        setGenreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 pt-6">
      {filters.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => {
            onChange(key);
            if (key !== "all") onGenreChange(null);
          }}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            active === key && !selectedGenre
              ? "bg-accent text-white"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
          aria-pressed={active === key && !selectedGenre}
        >
          {label}
        </button>
      ))}

      {/* Categories dropdown */}
      <div ref={genreRef} className="relative">
        <button
          onClick={() => setGenreOpen(!genreOpen)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            selectedGenre
              ? "bg-accent text-white"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          {selectedGenre
            ? GENRE_MAP.get(selectedGenre) ?? "Category"
            : "Categories"}
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`h-3 w-3 transition-transform ${genreOpen ? "rotate-180" : ""}`}
          />
        </button>

        {genreOpen && (
          <div className="absolute top-full left-0 z-30 mt-2 max-h-64 w-52 overflow-y-auto rounded-lg border border-white/10 bg-zinc-900 p-2 shadow-xl">
            {selectedGenre && (
              <button
                onClick={() => {
                  onGenreChange(null);
                  setGenreOpen(false);
                }}
                className="mb-1 w-full rounded px-3 py-1.5 text-left text-sm text-zinc-400 hover:bg-zinc-800"
              >
                Clear filter
              </button>
            )}
            {GENRES.map((genre) => (
              <button
                key={genre.id}
                onClick={() => {
                  onGenreChange(genre.id);
                  onChange("all");
                  setGenreOpen(false);
                }}
                className={`w-full rounded px-3 py-1.5 text-left text-sm transition-colors ${
                  selectedGenre === genre.id
                    ? "bg-accent/20 text-accent"
                    : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
