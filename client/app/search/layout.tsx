import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search for movies and TV shows by title. Find details, ratings, trailers, and streaming availability.",
  robots: { index: false, follow: true },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
