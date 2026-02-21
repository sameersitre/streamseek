import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Likes",
  description:
    "Your liked movies and TV shows. See all the media you've loved.",
  openGraph: {
    title: "Likes",
    description: "Your liked movies and TV shows on StreamSeek.",
  },
  alternates: { canonical: "/likes" },
};

export default function LikesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
