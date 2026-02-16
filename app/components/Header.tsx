"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/tvshows", label: "TV Shows" },
  { href: "/upcoming", label: "Upcoming" },
  { href: "/search", label: "Search" },
  { href: "/filter", label: "Filter" },
  { href: "/test", label: "Test" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-900/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
        <Link href="/" className="text-xl font-bold text-white">
          StreamSeek
        </Link>
        <div className="flex gap-1">
          {navLinks.map(({ href, label }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
