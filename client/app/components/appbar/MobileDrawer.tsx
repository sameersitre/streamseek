"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface NavLink {
  href: string;
  label: string;
}

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  pathname: string;
}

export default function MobileDrawer({
  isOpen,
  onClose,
  navLinks,
  pathname,
}: MobileDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-white/10 bg-zinc-900 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <Link
            href="/"
            onClick={onClose}
            className="text-xl font-bold text-white"
          >
            StreamSeek
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="py-4">
          <Link
            href="/"
            onClick={onClose}
            className={`block px-6 py-3 text-base font-medium transition-colors ${
              pathname === "/"
                ? "bg-white/5 text-accent"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            Home
          </Link>
          {navLinks.map(({ href, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`block px-6 py-3 text-base font-medium transition-colors ${
                  isActive
                    ? "bg-white/5 text-accent"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
