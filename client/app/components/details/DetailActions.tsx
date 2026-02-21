"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid, faBookmark as faBookmarkSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline, faBookmark as faBookmarkOutline } from "@fortawesome/free-regular-svg-icons";
import { useUserInteractions, useToggleLike, useToggleWatchlist } from "@/app/hooks/queries";
import AuthDialog from "@/app/components/auth/AuthDialog";

interface DetailActionsProps {
  mediaId: number;
  mediaType: string;
  title: string;
  posterPath: string | null;
  voteAverage: number;
}

export default function DetailActions({
  mediaId,
  mediaType,
  title,
  posterPath,
  voteAverage,
}: DetailActionsProps) {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { isLiked, isWatchlisted, isAuthenticated } = useUserInteractions();
  const toggleLike = useToggleLike();
  const toggleWatchlist = useToggleWatchlist();

  const liked = isLiked(mediaType, mediaId);
  const watchlisted = isWatchlisted(mediaType, mediaId);

  const toggleParams = { mediaId, mediaType, title, posterPath, voteAverage };

  const handleLike = () => {
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
      return;
    }
    toggleLike.mutate(toggleParams);
  };

  const handleWatchlist = () => {
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
      return;
    }
    toggleWatchlist.mutate(toggleParams);
  };

  return (
    <>
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            liked
              ? "bg-red-500/10 text-red-400"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          <FontAwesomeIcon
            icon={liked ? faHeartSolid : faHeartOutline}
            className="h-4 w-4"
          />
          Like
        </button>

        <button
          onClick={handleWatchlist}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            watchlisted
              ? "bg-accent/10 text-accent"
              : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          <FontAwesomeIcon
            icon={watchlisted ? faBookmarkSolid : faBookmarkOutline}
            className="h-4 w-4"
          />
          Watchlist
        </button>
      </div>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
}
