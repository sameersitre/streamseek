# StreamSeek

A movie and TV show discovery app built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

## Project Structure

```
app/
├── components/
│   └── Header.tsx              # Sticky nav bar with active link highlighting
├── details/[mediatype]/[id]/
│   └── page.tsx                # Media details (dynamic route: /details/movie/123)
├── filter/page.tsx             # Filter page
├── movies/page.tsx             # Movies listing
├── search/page.tsx             # Search page
├── test/page.tsx               # Test/dev page
├── tvshows/page.tsx            # TV Shows listing
├── upcoming/page.tsx           # Upcoming releases
├── globals.css                 # Global styles (dark theme, Tailwind v4)
├── layout.tsx                  # Root layout with Header
└── page.tsx                    # Dashboard (home page)
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

## Conventions

- Dark theme by default (background: #0a0a0a)
- Tailwind CSS v4 for styling
- Next.js App Router (file-based routing)
- Pagination via search params (`?page=1`) rather than route segments
- Dynamic route params for media details (`mediatype` and `id`)
