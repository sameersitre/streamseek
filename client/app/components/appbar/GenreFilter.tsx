"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GENRES } from "@/app/constants/genres";
import { useAppStore } from "@/app/stores/useAppStore";

export default function GenreFilter() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const selectedIds = useAppStore((s) => s.selectedGenreIds);
  const toggleGenre = useAppStore((s) => s.toggleGenre);
  const clearGenres = useAppStore((s) => s.clearGenres);

  const applyFilter = useCallback(() => {
    const genreParam = Array.from(selectedIds).join(",");
    router.push(`/filter?genres=${genreParam}`);
    setOpen(false);
  }, [selectedIds, router]);

  const selectedGenres = GENRES.filter((g) => selectedIds.has(g.id));
  const availableGenres = GENRES.filter((g) => !selectedIds.has(g.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Filter by genre"
        >
          <FontAwesomeIcon icon={faFilter} className="h-4 w-4" />
          {selectedIds.size > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
              {selectedIds.size}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-72 border-white/10 bg-zinc-900 p-4"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Filter by Genre</h3>
          {selectedIds.size > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={clearGenres}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Selected genres */}
        {selectedGenres.length > 0 && (
          <div className="mb-3">
            <p className="mb-1.5 text-xs text-zinc-500">Selected</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedGenres.map((genre) => (
                <Badge
                  key={genre.id}
                  className="cursor-pointer border-transparent bg-accent/20 text-accent hover:bg-accent/30"
                  onClick={() => toggleGenre(genre.id)}
                >
                  {genre.name}
                  <FontAwesomeIcon icon={faXmark} className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {selectedGenres.length > 0 && availableGenres.length > 0 && (
          <div className="mb-3 border-t border-white/10" />
        )}

        {/* Available genres */}
        <div className="mb-3">
          <p className="mb-1.5 text-xs text-zinc-500">
            {selectedGenres.length > 0 ? "Available" : "Select genres"}
          </p>
          <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto">
            {availableGenres.map((genre) => (
              <Badge
                key={genre.id}
                variant="outline"
                className="cursor-pointer border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
                onClick={() => toggleGenre(genre.id)}
              >
                {genre.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Apply button */}
        <Button
          onClick={applyFilter}
          disabled={selectedIds.size === 0}
          className="w-full bg-accent text-white hover:bg-accent/90 disabled:opacity-50"
          size="sm"
        >
          Filter{selectedIds.size > 0 && ` (${selectedIds.size})`}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
