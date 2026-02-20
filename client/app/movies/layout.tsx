import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movies",
  description:
    "Explore trending movies, top-rated films, and new releases. Find ratings, trailers, and streaming platforms.",
  openGraph: {
    title: "Movies",
    description:
      "Explore trending movies, top-rated films, and new releases on StreamSeek.",
  },
  alternates: { canonical: "/movies" },
};

export default function MoviesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
