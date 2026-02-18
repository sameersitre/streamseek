import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthProvider from "./providers/AuthProvider";
import SessionSync from "./components/auth/SessionSync";
import QueryProvider from "./providers/QueryProvider";
import Appbar from "./components/Appbar";
import Footer from "./components/Footer";
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
  title: {
    default: "StreamSeek",
    template: "%s | StreamSeek",
  },
  description: "Browse and discover movies, TV shows, and more",
  robots: { index: true, follow: true },
  openGraph: {
    siteName: "StreamSeek",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
      </body>
    </html>
  );
}
