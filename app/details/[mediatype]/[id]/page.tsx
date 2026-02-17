import type { Metadata } from "next";
import { apiClient } from "@/app/services/apiClient";
import { posterUrl } from "@/app/lib/tmdb";
import DetailsClient from "./DetailsClient";

type Params = Promise<{ mediatype: string; id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { mediatype, id } = await params;

  try {
    const details = await apiClient.details({
      id,
      media_type: mediatype,
    });

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
    };
  } catch {
    return { title: "Details" };
  }
}

export default async function MediaDetails({ params }: { params: Params }) {
  const { mediatype, id } = await params;

  return <DetailsClient mediatype={mediatype} id={id} />;
}
