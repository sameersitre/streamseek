"use client";

import Image from "next/image";
import { profileUrl } from "@/app/lib/tmdb";
import type { PersonItem } from "@/app/types";

interface PeopleCardProps {
  person: PersonItem;
}

export default function PeopleCard({ person }: PeopleCardProps) {
  const knownFor = person.known_for
    ?.slice(0, 2)
    .map((item) => item.title || item.name)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex w-[130px] flex-col items-center gap-2 sm:w-[150px]">
      {/* Profile photo */}
      <div className="relative h-[130px] w-[130px] overflow-hidden rounded-full border-2 border-zinc-800 sm:h-[150px] sm:w-[150px]">
        {person.profile_path ? (
          <Image
            src={profileUrl(person.profile_path, "w300")}
            alt={person.name}
            fill
            className="object-cover"
            sizes="150px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-sm text-zinc-500">
            No Photo
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="line-clamp-1 text-center text-sm font-medium text-white">
        {person.name}
      </h3>

      {/* Known for */}
      {person.known_for_department && (
        <span className="text-xs text-zinc-500">{person.known_for_department}</span>
      )}
      {knownFor && (
        <p className="line-clamp-1 text-center text-xs text-zinc-400">{knownFor}</p>
      )}
    </div>
  );
}
