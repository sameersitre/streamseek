import Image from "next/image";
import { posterUrl } from "@/app/lib/tmdb";

interface MediaPosterProps {
  path: string | null | undefined;
  alt: string;
  size?: "w300" | "w500";
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export default function MediaPoster({
  path,
  alt,
  size = "w500",
  fill,
  width,
  height,
  className,
  priority = false,
}: MediaPosterProps) {
  const src = posterUrl(path, size);

  if (!path) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-800 text-zinc-500 ${className ?? ""}`}
        style={!fill ? { width, height } : undefined}
      >
        No Image
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover ${className ?? ""}`}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 200}
      height={height ?? 300}
      className={className}
      priority={priority}
    />
  );
}
