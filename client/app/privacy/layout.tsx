import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "StreamSeek privacy policy. Learn how we collect, use, and protect your data when using our movie and TV show discovery platform.",
  openGraph: {
    title: "Privacy Policy",
    description:
      "Learn how StreamSeek handles your data and protects your privacy.",
  },
  alternates: { canonical: "/privacy" },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
