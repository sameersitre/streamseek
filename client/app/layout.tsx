import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthProvider from "./providers/AuthProvider";
import SessionSync from "./components/auth/SessionSync";
import QueryProvider from "./providers/QueryProvider";
import FloTrace from "./providers/FloTrace";
import Appbar from "./components/Appbar";
import Footer from "./components/Footer";
import { WebsiteJsonLd } from "./components/JsonLd";
import { siteConfig } from "./lib/siteConfig";
import "./globals.css";
config.autoAddCss = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
  openGraph: {
    siteName: siteConfig.name,
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — Movie & TV Show Discovery`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content={siteConfig.themeColor} />
        <meta name="color-scheme" content="dark" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FloTrace>
          <AuthProvider>
            <QueryProvider>
              <TooltipProvider>
                <SessionSync />
                <Appbar />
                <main className="pt-20">{children}</main>
                <Footer />
              </TooltipProvider>
            </QueryProvider>
          </AuthProvider>
        </FloTrace>
        <WebsiteJsonLd />
      </body>
    </html>
  );
}
