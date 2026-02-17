"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleUser, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useAppStore } from "@/app/stores/useAppStore";
import AuthDialog from "@/app/components/auth/AuthDialog";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userProfile = useAppStore((s) => s.userProfile);

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

  const handleLogin = () => {
    setIsOpen(false);
    setShowAuth(true);
  };

  const handleSignOut = () => {
    setIsOpen(false);
    signOut();
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => (userProfile ? setIsOpen(!isOpen) : handleLogin())}
          className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="User menu"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {userProfile?.photoURL ? (
            <Image
              src={userProfile.photoURL}
              alt={userProfile.displayName || "User"}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <FontAwesomeIcon icon={faCircleUser} className="h-5 w-5" />
          )}
        </button>

        {userProfile && (
          <div
            className={`absolute right-0 top-full mt-2 w-56 origin-top-right rounded-lg border border-white/10 bg-zinc-800 py-1 shadow-xl transition-all duration-150 ${
              isOpen
                ? "scale-100 opacity-100"
                : "pointer-events-none scale-95 opacity-0"
            }`}
            role="menu"
          >
            <div className="border-b border-white/10 px-4 py-2">
              <p className="truncate text-sm font-medium text-white">
                {userProfile.displayName || "User"}
              </p>
              {userProfile.email && (
                <p className="truncate text-xs text-zinc-400">
                  {userProfile.email}
                </p>
              )}
            </div>

            <button
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              role="menuitem"
              onClick={handleSignOut}
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        )}
      </div>

      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </>
  );
}
