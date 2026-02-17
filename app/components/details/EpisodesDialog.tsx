"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSeasonEpisodes } from "@/app/hooks/queries";
import { posterUrl } from "@/app/lib/tmdb";
import { formatDate } from "@/app/lib/formatDate";
import type { Season } from "@/app/types";

interface EpisodesDialogProps {
  season: Season;
  showId: string;
  open: boolean;
  onClose: () => void;
}

export default function EpisodesDialog({
  season,
  showId,
  open,
  onClose,
}: EpisodesDialogProps) {
  const { data, isLoading } = useSeasonEpisodes(showId, season.season_number);
  const episodes = data?.episodes ?? [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-white/10 bg-zinc-900">
        <DialogHeader>
          <div className="flex gap-4">
            {season.poster_path && (
              <Image
                src={posterUrl(season.poster_path, "w300")}
                alt={season.name}
                width={80}
                height={120}
                className="rounded-lg object-cover"
              />
            )}
            <div>
              <DialogTitle className="text-white">{season.name}</DialogTitle>
              <p className="mt-1 text-sm text-zinc-400">
                {season.episode_count} episodes
              </p>
              {season.air_date && (
                <p className="text-sm text-zinc-400">
                  {formatDate(season.air_date)}
                </p>
              )}
              {season.overview && (
                <p className="mt-2 text-sm text-zinc-300">{season.overview}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="mt-4 max-h-[60vh]">
          {isLoading ? (
            <p className="py-4 text-center text-zinc-500">
              Loading episodes...
            </p>
          ) : episodes.length === 0 ? (
            <p className="py-4 text-center text-zinc-500">
              No episodes found.
            </p>
          ) : (
            <div className="space-y-3 pr-4">
              {episodes.map((ep) => (
                <div
                  key={ep.id}
                  className="flex gap-3 rounded-lg bg-zinc-800/50 p-3"
                >
                  {ep.still_path && (
                    <Image
                      src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                      alt={ep.name}
                      width={160}
                      height={90}
                      className="shrink-0 rounded object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">
                      {ep.episode_number}. {ep.name}
                    </p>
                    {ep.air_date && (
                      <p className="text-xs text-zinc-500">
                        {formatDate(ep.air_date)}
                      </p>
                    )}
                    {ep.overview && (
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                        {ep.overview}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
