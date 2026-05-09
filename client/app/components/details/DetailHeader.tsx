import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/app/lib/formatDate";
import DetailActions from "./DetailActions";
import type { MediaDetails, ContentMediaType } from "@/app/types";

interface DetailHeaderProps {
  details: MediaDetails;
  mediaType: ContentMediaType;
  mediaId: string;
}

export default function DetailHeader({ details, mediaType, mediaId }: DetailHeaderProps) {
  const title = details.title || details.name || "Untitled";
  const date = details.release_date || details.first_air_date;
  const runtime =
    details.runtime || (details.episode_run_time?.[0] ?? null);

  return (
    <div className="flex flex-col gap-2">
      {/* Title */}
      <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>

      {/* Tagline */}
      {details.tagline && (
        <p className="text-sm italic text-zinc-400">{details.tagline}</p>
      )}

      {/* Meta row: rating, date, runtime */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
        {details.vote_average > 0 && (
          <span className="font-semibold text-accent">
            ★ {details.vote_average.toFixed(1)}
            <span className="ml-1 text-xs font-normal text-zinc-500">
              ({details.vote_count})
            </span>
          </span>
        )}

        {date && <span>{formatDate(date)}</span>}

        {runtime && <span>{runtime} min</span>}

        {details.imdb_id && (
          <a
            href={`https://www.imdb.com/title/${details.imdb_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-yellow-400 hover:underline"
          >
            IMDb
          </a>
        )}
      </div>

      <Separator className="my-1 bg-white/10" />

      {/* Genre badges */}
      {details.genres?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {details.genres.map((genre) => (
            <Badge
              key={genre.id}
              variant="outline"
              className="border-white/10 text-zinc-300"
            >
              {genre.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Like + Watchlist actions */}
      <DetailActions
        mediaId={Number(mediaId)}
        mediaType={mediaType}
        title={title}
        posterPath={details.poster_path}
        voteAverage={details.vote_average}
      />
    </div>
  );
}
