import type { Metadata } from "next";

export const metadata: Metadata = { title: "TV Shows" };

export default function TVShowsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
