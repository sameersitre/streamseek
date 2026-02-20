import { siteConfig } from "@/app/lib/siteConfig";
import type { MediaDetails } from "@/app/types";

export function WebsiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface MediaJsonLdProps {
  details: MediaDetails;
  mediatype: string;
}

export function MediaJsonLd({ details, mediatype }: MediaJsonLdProps) {
  const title = details.title || details.name || "Untitled";
  const datePublished = details.release_date || details.first_air_date;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": mediatype === "tv" ? "TVSeries" : "Movie",
    name: title,
    description: details.overview,
    image: details.poster_path
      ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
      : undefined,
    datePublished,
    genre: details.genres?.map((g) => g.name),
  };

  if (details.vote_count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: details.vote_average.toFixed(1),
      bestRating: "10",
      ratingCount: details.vote_count,
    };
  }

  if (mediatype === "movie" && details.runtime) {
    schema.duration = `PT${details.runtime}M`;
  }

  if (mediatype === "tv") {
    if (details.number_of_seasons) {
      schema.numberOfSeasons = details.number_of_seasons;
    }
    if (details.number_of_episodes) {
      schema.numberOfEpisodes = details.number_of_episodes;
    }
  }

  // Strip undefined values
  const cleanSchema = JSON.parse(JSON.stringify(schema));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanSchema) }}
    />
  );
}
