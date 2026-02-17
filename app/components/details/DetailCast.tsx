import Image from "next/image";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { profileUrl } from "@/app/lib/tmdb";
import type { CastMember } from "@/app/types";

interface DetailCastProps {
  cast: CastMember[];
}

export default function DetailCast({ cast }: DetailCastProps) {
  if (!cast || cast.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="mb-3 text-lg font-semibold text-white">Cast</h2>
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-4">
          {cast.map((member) => (
            <div
              key={member.id}
              className="group relative shrink-0 overflow-hidden rounded-lg bg-zinc-800/50"
              style={{ width: 130 }}
            >
              {member.profile_path ? (
                <Image
                  src={profileUrl(member.profile_path, "w300")}
                  alt={member.actor}
                  width={130}
                  height={195}
                  className="h-[195px] w-[130px] object-cover"
                />
              ) : (
                <div className="flex h-[195px] w-[130px] items-center justify-center bg-zinc-700 text-xs text-zinc-500">
                  No Photo
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-black/80 p-2">
                <p className="truncate text-xs font-medium text-white">
                  {member.actor}
                </p>
                <p className="truncate text-[10px] text-zinc-400">
                  {member.character}
                </p>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
