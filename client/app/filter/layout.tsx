import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Filter",
  description:
    "Filter movies and TV shows by genre. Discover action, comedy, drama, thriller, sci-fi, and more.",
  robots: { index: false, follow: true },
};

export default function FilterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
