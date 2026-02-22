import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { REGION_MAP } from "@/app/types/details";
import type { OTTPlatform } from "@/app/types";

interface DetailStreamsProps {
  platforms: OTTPlatform[];
}

export default function DetailStreams({ platforms }: DetailStreamsProps) {
  if (!platforms || platforms.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="mb-3 text-lg font-semibold text-white">
        Where to Watch
      </h2>
      <div className="flex flex-wrap gap-3">
        {platforms.map((platform) => (
          <Tooltip key={platform.name}>
            <TooltipTrigger asChild>
              <a
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="overflow-hidden rounded-lg transition-transform hover:scale-110"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={platform.icon}
                  alt={platform.name}
                  width={60}
                  height={60}
                  className="rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </a>
            </TooltipTrigger>
            <TooltipContent>
              <p>{platform.name} in {REGION_MAP[platform.region] ?? platform.region}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
