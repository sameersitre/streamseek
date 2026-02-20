import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TV Shows",
  description:
    "Browse trending TV series, new shows, and top-rated series. Find episode guides, trailers, and where to watch.",
  openGraph: {
    title: "TV Shows",
    description:
      "Browse trending TV series and top-rated shows on StreamSeek.",
  },
  alternates: { canonical: "/tvshows" },
};

export default function TVShowsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
