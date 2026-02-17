import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile, UserLocation } from "@/app/types";

interface AppState {
  // Search (ephemeral — also driven by URL)
  searchText: string;
  setSearchText: (text: string) => void;

  // Genre filter (ephemeral — also driven by URL)
  selectedGenreIds: Set<number>;
  toggleGenre: (id: number) => void;
  setGenreIds: (ids: Set<number>) => void;
  clearGenres: () => void;

  // User profile (persisted to localStorage)
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;

  // User location
  userLocation: UserLocation | null;
  setUserLocation: (location: UserLocation) => void;

  // UI flags
  isMobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Search
      searchText: "",
      setSearchText: (text) => set({ searchText: text }),

      // Genre filter
      selectedGenreIds: new Set<number>(),
      toggleGenre: (id) =>
        set((state) => {
          const next = new Set(state.selectedGenreIds);
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
          return { selectedGenreIds: next };
        }),
      setGenreIds: (ids) => set({ selectedGenreIds: ids }),
      clearGenres: () => set({ selectedGenreIds: new Set() }),

      // User profile
      userProfile: null,
      setUserProfile: (profile) => set({ userProfile: profile }),

      // User location
      userLocation: null,
      setUserLocation: (location) => set({ userLocation: location }),

      // UI flags
      isMobileDrawerOpen: false,
      setMobileDrawerOpen: (open) => set({ isMobileDrawerOpen: open }),
    }),
    {
      name: "streamseek-app-store",
      partialize: (state) => ({
        userProfile: state.userProfile,
      }),
    }
  )
);
