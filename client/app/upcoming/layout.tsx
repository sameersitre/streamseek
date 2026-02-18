import type { Metadata } from "next";

export const metadata: Metadata = { title: "Upcoming" };

export default function UpcomingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
