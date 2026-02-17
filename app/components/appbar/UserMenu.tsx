"use client";

import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="User menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <FontAwesomeIcon icon={faCircleUser} className="h-5 w-5" />
      </button>

      <div
        className={`absolute right-0 top-full mt-2 w-48 origin-top-right rounded-lg border border-white/10 bg-zinc-800 py-1 shadow-xl transition-all duration-150 ${
          isOpen
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
        role="menu"
      >
        <button
          className="block w-full px-4 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          role="menuitem"
          onClick={() => setIsOpen(false)}
        >
          Login
        </button>
      </div>
    </div>
  );
}
