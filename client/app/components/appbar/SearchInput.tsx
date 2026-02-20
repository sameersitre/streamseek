"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useDebounce } from "@/app/hooks/useDebounce";

export default function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 1300);

  useEffect(() => {
    if (pathname === "/search") {
      const q = searchParams.get("q") || "";
      setSearchText(q);
    } else {
      setSearchText("");
    }
  }, [pathname, searchParams]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (debouncedSearch.trim().length > 1) {
      const query = encodeURIComponent(debouncedSearch.trim());
      if (pathname === "/search") {
        router.replace(`/search?q=${query}`);
      } else {
        router.push(`/search?q=${query}`);
      }
    }
  }, [debouncedSearch, router]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchText.trim().length > 1) {
      const query = encodeURIComponent(searchText.trim());
      router.push(`/search?q=${query}`);
    }
  };

  return (
    <div className="relative flex items-center">
      <FontAwesomeIcon
        icon={faMagnifyingGlass}
        className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500"
      />
      <input
        type="text"
        placeholder="Search..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-40 rounded-full border border-white/10 bg-white/10 py-1.5 pl-9 pr-4 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:border-accent focus:outline-none lg:w-60"
        aria-label="Search movies and TV shows"
      />
    </div>
  );
}
