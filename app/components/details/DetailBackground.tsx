import Image from "next/image";
import { backdropUrl } from "@/app/lib/tmdb";

interface DetailBackgroundProps {
  path: string | null | undefined;
}

export default function DetailBackground({ path }: DetailBackgroundProps) {
  if (!path) return null;

  return (
    <div className="fixed inset-0 -z-10">
      <Image
        src={backdropUrl(path)}
        alt=""
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/70 to-black" />
    </div>
  );
}
