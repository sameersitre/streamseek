"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

export default function DetailsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <FontAwesomeIcon
        icon={faTriangleExclamation}
        className="h-12 w-12 text-accent"
      />
      <h2 className="text-2xl font-bold text-white">
        Could not load media details
      </h2>
      <p className="max-w-md text-sm text-zinc-400">
        We couldn&apos;t fetch the details for this title. Please try again.
      </p>
      <Button
        onClick={reset}
        className="mt-2 bg-accent text-white hover:bg-accent/90"
      >
        Try again
      </Button>
    </div>
  );
}
