"use client";

import {
  useMediaDetails,
  useMediaVideos,
  useMediaCast,
  useOTTPlatforms,
  useRecommendations,
} from "@/app/hooks/queries";
import DetailBackground from "@/app/components/details/DetailBackground";
import DetailPoster from "@/app/components/details/DetailPoster";
import DetailHeader from "@/app/components/details/DetailHeader";
import DetailOverview from "@/app/components/details/DetailOverview";
import DetailCast from "@/app/components/details/DetailCast";
import DetailStreams from "@/app/components/details/DetailStreams";
import DetailVideos from "@/app/components/details/DetailVideos";
import DetailRecommends from "@/app/components/details/DetailRecommends";
import DetailSeasons from "@/app/components/details/DetailSeasons";
import DetailSkeleton from "@/app/components/details/DetailSkeleton";

interface DetailsClientProps {
  mediatype: string;
  id: string;
}

export default function DetailsClient({ mediatype, id }: DetailsClientProps) {
  // 5 parallel queries — TanStack Query handles concurrency natively
  const {
    data: details,
    isLoading: detailsLoading,
    isError,
  } = useMediaDetails(mediatype, id);
  const { data: videosData } = useMediaVideos(mediatype, id);
  const { data: castData } = useMediaCast(mediatype, id);
  const { data: ottData } = useOTTPlatforms(mediatype, id);
  const { data: recommendsData } = useRecommendations(mediatype, id);

  if (detailsLoading) {
    return <DetailSkeleton />;
  }

  if (isError || !details) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-lg text-zinc-400">Could not load media details.</p>
        <p className="text-sm text-zinc-600">Please try refreshing the page.</p>
      </div>
    );
  }

  const title = details.title || details.name || "Untitled";

  return (
    <>
      <DetailBackground path={details.backdrop_path} />

      <div className="relative mx-auto max-w-5xl px-6 py-10">
        {/* Top section: Poster + Header */}
        <div className="flex flex-col gap-6 sm:flex-row">
          <DetailPoster path={details.poster_path} title={title} />
          <DetailHeader details={details} mediaType={mediatype} mediaId={id} />
        </div>

        {/* Overview */}
        <DetailOverview overview={details.overview} />

        {/* Streams / OTT */}
        {ottData?.platforms && <DetailStreams platforms={ottData.platforms} />}

        {/* Videos / Trailers */}
        {videosData?.results && <DetailVideos videos={videosData.results} />}

        {/* TV Seasons */}
        {mediatype === "tv" && details.seasons && (
          <DetailSeasons seasons={details.seasons} showId={id} />
        )}

        {/* Cast */}
        {castData?.cast && <DetailCast cast={castData.cast} />}

        {/* Recommendations */}
        {recommendsData?.results && (
          <DetailRecommends items={recommendsData.results} />
        )}
      </div>
    </>
  );
}
