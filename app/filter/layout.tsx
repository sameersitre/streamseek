import type { Metadata } from "next";

export const metadata: Metadata = { title: "Filter" };

export default function FilterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
