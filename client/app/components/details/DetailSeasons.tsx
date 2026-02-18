"use client";

import { useState } from "react";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { posterUrl } from "@/app/lib/tmdb";
import EpisodesDialog from "./EpisodesDialog";
import type { Season } from "@/app/types";

interface DetailSeasonsProps {
  seasons: Season[];
  showId: string;
}

export default function DetailSeasons({ seasons, showId }: DetailSeasonsProps) {
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  if (!seasons || seasons.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="mb-3 text-lg font-semibold text-white">Seasons</h2>
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-4">
          {seasons.map((season) => (
            <button
              key={season.id}
              onClick={() => setSelectedSeason(season)}
              className="group relative shrink-0 overflow-hidden rounded-lg transition-transform hover:scale-105"
            >
              {season.poster_path ? (
                <Image
                  src={posterUrl(season.poster_path, "w300")}
                  alt={season.name}
                  width={125}
                  height={188}
                  className="h-[188px] w-[125px] rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-[188px] w-[125px] items-center justify-center rounded-lg bg-zinc-800 text-xs text-zinc-500">
                  No Image
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-black/80 p-2">
                <p className="truncate text-xs font-medium text-white">
                  {season.name}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {season.episode_count} episodes
                </p>
              </div>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {selectedSeason && (
        <EpisodesDialog
          season={selectedSeason}
          showId={showId}
          open={!!selectedSeason}
          onClose={() => setSelectedSeason(null)}
        />
      )}
    </div>
  );
}
