"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import type { Video } from "@/app/types";

interface DetailVideosProps {
  videos: Video[];
}

export default function DetailVideos({ videos }: DetailVideosProps) {
  const [selected, setSelected] = useState<Video | null>(null);

  if (!videos || videos.length === 0) return null;

  const trailers = videos.slice(0, 15);

  return (
    <div className="mt-6">
      <h2 className="mb-3 text-lg font-semibold text-white">Videos</h2>
      <div className="flex flex-wrap gap-2">
        {trailers.map((video, i) => (
          <Button
            key={video.id}
            variant="outline"
            size="sm"
            onClick={() => setSelected(video)}
            className="border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            <FontAwesomeIcon icon={faPlay} className="mr-1.5 h-3 w-3" />
            {i + 1}. {video.type}
          </Button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-4xl border-white/10 bg-black p-0">
          <DialogTitle className="sr-only">
            {selected?.name || "Video"}
          </DialogTitle>
          {selected && (
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${selected.key}?autoplay=1`}
                title={selected.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
