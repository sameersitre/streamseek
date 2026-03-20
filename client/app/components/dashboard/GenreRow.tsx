/** Lazy-loaded genre row — only fetches TMDB data when scrolled near the viewport. */
"use client";

import { useDiscoverByGenre } from "@/app/hooks/queries";
import { useInView } from "@/app/hooks/useInView";
import MediaRow from "./MediaRow";

interface GenreRowProps {
  genreId: number;
  genreName: string;
}

export default function GenreRow({ genreId, genreName }: GenreRowProps) {
  const { ref, isInView } = useInView();
  const { data, isLoading, isError } = useDiscoverByGenre(genreId, 1, isInView);

  return (
    <div ref={ref}>
      <MediaRow
        title={genreName}
        items={data?.results}
        isLoading={isInView && isLoading}
        isError={isError}
      />
    </div>
  );
}
