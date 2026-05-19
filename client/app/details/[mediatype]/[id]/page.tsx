import { cache } from "react";
import type { Metadata } from "next";
import { apiClient } from "@/app/services/apiClient";
import { posterUrl } from "@/app/lib/tmdb";
import { MediaJsonLd } from "@/app/components/JsonLd";
import DetailsClient from "./DetailsClient";
import type { ContentMediaType } from "@/app/types";

type Params = Promise<{ mediatype: string; id: string }>;

// URL params are always strings; the [mediatype] route segment is guaranteed to
// be "movie" | "tv" — this helper centralises the boundary assertion.
const parseMediaType = (s: string): ContentMediaType => s as ContentMediaType;

const getDetails = cache((id: string, mediatype: ContentMediaType) =>
  apiClient.details({ id, media_type: mediatype })
);

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { mediatype: mediatypeRaw, id } = await params;
  const mediatype = parseMediaType(mediatypeRaw);

  try {
    const details = await getDetails(id, mediatype);

    const title = details.title || details.name || "Details";
    const description =
      details.overview?.slice(0, 160) || "View details on StreamSeek";
    const image = posterUrl(details.poster_path);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: details.poster_path ? [image] : [],
        type: mediatype === "tv" ? "video.tv_show" : "video.movie",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: details.poster_path ? [image] : [],
      },
      alternates: {
        canonical: `/details/${mediatype}/${id}`,
      },
    };
  } catch {
    return { title: "Details" };
  }
}

export default async function MediaDetails({ params }: { params: Params }) {
  const { mediatype: mediatypeRaw, id } = await params;
  const mediatype = parseMediaType(mediatypeRaw);

  let jsonLd = null;
  try {
    const details = await getDetails(id, mediatype);
    jsonLd = <MediaJsonLd details={details} mediatype={mediatype} />;
  } catch {
    // JSON-LD is non-critical; skip on error
  }

  return (
    <>
      {jsonLd}
      <DetailsClient mediatype={mediatype} id={id} />
    </>
  );
}
