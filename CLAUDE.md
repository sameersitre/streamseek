# StreamSeek

A movie and TV show discovery app built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

## Project Structure

```
app/
├── components/
│   ├── Appbar.tsx                  # Main app bar (fixed, gradient, responsive)
│   ├── Header.tsx                  # Legacy simple header (kept as reference)
│   └── appbar/
│       ├── DesktopNav.tsx          # Desktop nav links with active state
│       ├── GenreFilter.tsx         # Genre filter popover with chip selection (shadcn)
│       ├── MobileDrawer.tsx        # Slide-over mobile navigation drawer
│       ├── SearchInput.tsx         # Debounced search input (1300ms)
│       └── UserMenu.tsx            # User icon with dropdown menu
├── constants/
│   └── genres.ts                   # TMDB genre data (19 genres with real IDs)
├── hooks/
│   └── useDebounce.ts              # Generic debounce hook
├── details/[mediatype]/[id]/
│   └── page.tsx                    # Media details (dynamic route: /details/movie/123)
├── filter/page.tsx                 # Filter page (receives ?genres=28,12,16)
├── movies/page.tsx                 # Movies listing
├── search/page.tsx                 # Search page (receives ?q=query)
├── test/page.tsx                   # Test/dev page
├── tvshows/page.tsx                # TV Shows listing
├── upcoming/page.tsx               # Upcoming releases
├── globals.css                     # Global styles (dark theme, shadcn + Tailwind v4)
├── layout.tsx                      # Root layout with Appbar + Font Awesome config
└── page.tsx                        # Dashboard (home page)

components/
└── ui/                             # shadcn/ui components (project root)
    ├── badge.tsx
    ├── button.tsx
    └── popover.tsx

lib/
└── utils.ts                        # cn() class merge utility (clsx + tailwind-merge)
```

## Routes

| Route | Page | Type |
|---|---|---|
| `/` | Dashboard | Static |
| `/movies` | Movies | Static |
| `/tvshows` | TV Shows | Static |
| `/upcoming` | Upcoming | Static |
| `/search` | Search | Static |
| `/details/[mediatype]/[id]` | Media Details | Dynamic |
| `/filter` | Filter | Static |
| `/test` | Test | Static |

## Key Libraries

- **shadcn/ui** — Badge, Button, Popover (Radix-based, in `components/ui/`)
- **Font Awesome** — Icons (`@fortawesome/react-fontawesome`)
- **Tailwind CSS v4** — Styling with `@theme inline` custom properties

## Conventions

- Dark theme by default (oklch dark zinc palette, always-dark — no light/dark toggle)
- Accent color: `#E46E36` (orange) — registered as `--color-accent` in `@theme inline`
- shadcn/ui components in `components/ui/` (project root), app components in `app/components/`
- `cn()` from `lib/utils.ts` for class merging in shadcn components
- Pagination via search params (`?page=1`) rather than route segments
- Genre filter via search params (`?genres=28,12,16`)
- Dynamic route params for media details (`mediatype` and `id`)
- Font Awesome SSR: `config.autoAddCss = false` + explicit CSS import in layout
- `useSearchParams()` must be wrapped in `<Suspense>` boundary
