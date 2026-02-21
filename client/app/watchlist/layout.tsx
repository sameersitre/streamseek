import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watchlist",
  description:
    "Your personal watchlist. Keep track of movies and TV shows you want to watch.",
  openGraph: {
    title: "Watchlist",
    description: "Your personal watchlist on StreamSeek.",
  },
  alternates: { canonical: "/watchlist" },
};

export default function WatchlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
