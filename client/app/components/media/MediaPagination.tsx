"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

interface MediaPaginationProps {
  currentPage: number;
  totalPages?: number;
}

export default function MediaPagination({
  currentPage,
  totalPages,
}: MediaPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigate = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    window.scrollTo(0, 0);
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasPrev = currentPage > 1;
  const hasNext = totalPages ? currentPage < totalPages : true;

  return (
    <div className="mt-10 flex items-center justify-center gap-4">
      <Button
        onClick={() => navigate(currentPage - 1)}
        disabled={!hasPrev}
        className="bg-accent text-white hover:bg-accent/90 disabled:opacity-50"
        size="sm"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="mr-1 h-3 w-3" />
        Previous
      </Button>

      <span className="text-sm text-zinc-400">
        Page {currentPage}
        {totalPages ? ` of ${totalPages}` : ""}
      </span>

      <Button
        onClick={() => navigate(currentPage + 1)}
        disabled={!hasNext}
        className="bg-accent text-white hover:bg-accent/90 disabled:opacity-50"
        size="sm"
      >
        Next
        <FontAwesomeIcon icon={faChevronRight} className="ml-1 h-3 w-3" />
      </Button>
    </div>
  );
}
