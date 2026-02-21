"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import DesktopNav from "./appbar/DesktopNav";
import SearchInput from "./appbar/SearchInput";
import GenreFilter from "./appbar/GenreFilter";
import UserMenu from "./appbar/UserMenu";
import MobileDrawer from "./appbar/MobileDrawer";

const navLinks = [
  { href: "/movies", label: "Movies" },
  { href: "/tvshows", label: "TV Shows" },
  { href: "/upcoming", label: "Upcoming" },
  { href: "/watchlist", label: "Watchlist" },
];

export default function Appbar() {
  const pathname = usePathname();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-black via-black/80 to-transparent">
        <nav className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          {/* Mobile hamburger */}
          <button
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setIsMobileDrawerOpen(true)}
            aria-label="Open menu"
          >
            <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-white">
            StreamSeek
          </Link>

          {/* Desktop nav links */}
          <DesktopNav navLinks={navLinks} pathname={pathname} />

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <Suspense fallback={null}>
            <SearchInput />
          </Suspense>

          {/* Genre filter */}
          <GenreFilter />

          {/* User menu */}
          <UserMenu />
        </nav>
      </header>

      {/* Mobile drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        navLinks={navLinks}
        pathname={pathname}
      />
    </>
  );
}
