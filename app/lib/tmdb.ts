const IMAGE_BASE = "https://image.tmdb.org/t/p";

type PosterSize = "w300" | "w500";
type BackdropSize = "w780" | "original";
type ProfileSize = "w300" | "w500";

export function posterUrl(
  path: string | null | undefined,
  size: PosterSize = "w500"
): string {
  if (!path) return "/no-poster.svg";
  return `${IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(
  path: string | null | undefined,
  size: BackdropSize = "original"
): string {
  if (!path) return "";
  return `${IMAGE_BASE}/${size}${path}`;
}

export function profileUrl(
  path: string | null | undefined,
  size: ProfileSize = "w500"
): string {
  if (!path) return "/no-profile.svg";
  return `${IMAGE_BASE}/${size}${path}`;
}
