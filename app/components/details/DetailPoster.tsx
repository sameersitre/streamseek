import MediaPoster from "@/app/components/media/MediaPoster";

interface DetailPosterProps {
  path: string | null | undefined;
  title: string;
}

export default function DetailPoster({ path, title }: DetailPosterProps) {
  return (
    <div className="shrink-0 overflow-hidden rounded-lg shadow-xl">
      <MediaPoster
        path={path}
        alt={title}
        size="w500"
        width={160}
        height={240}
        className="rounded-lg"
        priority
      />
    </div>
  );
}
