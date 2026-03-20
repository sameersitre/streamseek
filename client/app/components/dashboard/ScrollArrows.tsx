/** Left/right arrow overlays for horizontal scroll rows. Hidden on mobile (touch scroll). */
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface ScrollArrowsProps {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScroll: (direction: "left" | "right") => void;
}

export default function ScrollArrows({ canScrollLeft, canScrollRight, onScroll }: ScrollArrowsProps) {
  return (
    <>
      {canScrollLeft && (
        <button
          onClick={() => onScroll("left")}
          className="absolute top-1/2 left-0 z-10 hidden -translate-y-1/2 rounded-r-md bg-black/70 px-1.5 py-8 text-white transition-opacity hover:bg-black/90 md:group-hover/row:block"
          aria-label="Scroll left"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => onScroll("right")}
          className="absolute top-1/2 right-0 z-10 hidden -translate-y-1/2 rounded-l-md bg-black/70 px-1.5 py-8 text-white transition-opacity hover:bg-black/90 md:group-hover/row:block"
          aria-label="Scroll right"
        >
          <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
        </button>
      )}
    </>
  );
}
