import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upcoming",
  description:
    "Discover upcoming movie releases and new shows coming soon. Stay ahead with release dates and previews.",
  openGraph: {
    title: "Upcoming Releases",
    description:
      "Upcoming movies and TV shows coming soon on StreamSeek.",
  },
  alternates: { canonical: "/upcoming" },
};

export default function UpcomingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
