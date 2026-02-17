import Link from "next/link";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { posterUrl } from "@/app/lib/tmdb";
import type { MediaItem } from "@/app/types";

interface DetailRecommendsProps {
  items: MediaItem[];
}

export default function DetailRecommends({ items }: DetailRecommendsProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="mb-3 text-lg font-semibold text-white">Recommendations</h2>
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-4">
          {items.map((item) => {
            const mediaType = item.media_type || "movie";
            return (
              <Link
                key={item.id}
                href={`/details/${mediaType}/${item.id}`}
                className="shrink-0 overflow-hidden rounded-lg transition-transform hover:scale-105"
              >
                {item.poster_path ? (
                  <Image
                    src={posterUrl(item.poster_path, "w300")}
                    alt={item.title || item.name || ""}
                    width={130}
                    height={195}
                    className="h-[195px] w-[130px] rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-[195px] w-[130px] items-center justify-center rounded-lg bg-zinc-800 text-xs text-zinc-500">
                    No Image
                  </div>
                )}
              </Link>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
