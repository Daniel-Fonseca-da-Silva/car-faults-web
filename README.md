# Car Faults Web

Frontend for **Car Faults** — a SaaS focused on **chronic reliability by vehicle model**: what typically fails on a given make / model / year / engine, how severe it is, typical cost and how it gets fixed.

Initial market: **Portugal** (later ES/FR). Product languages: `pt-PT` (default), `en-GB` and `es-ES`.

## What we are

The Next.js frontend that consumes [`car-faults-api`](../car-faults-api) (Nest backend) through `lib/api/*` and renders known-issue lookups, reviews, and fixes for buyers and owners. There is no mock backend — every page that needs data calls the Nest API server-side or via the browser client in `lib/api/client.ts`.

## What we are not

We do **not** call the AI service directly, provide VIN history, odometer fraud checks, or accident records for a specific vehicle (that problem space belongs to services like carVertical / Certidão / IPO). All AI-generated content is fetched through the Nest API, never from [`car-faults-ai-api`](../car-faults-ai-api).

## Problem we solve

Known-issue information is fragmented across forums, YouTube, ADAC/TÜV reports, and Facebook groups. Buyers and used-car owners often discover chronic faults too late. This app gives them one place to look up a model before they buy.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS + shadcn/ui |
| i18n | [next-intl](https://next-intl.dev) (`pt-PT` / `en-GB` / `es-ES`, locale-prefixed routes) |
| Tests | Jest + React Testing Library |
| Backend | [car-faults-api](../car-faults-api) (Nest) — never calls AI directly |

No Supabase, Prisma, or Mapbox — those were leftovers from the original template and have been removed.

## Project structure

```
app/
  layout.tsx                 # <html>/<body>, fonts
  [locale]/
    layout.tsx                # NextIntlClientProvider, SiteHeader, SiteFooter
    page.tsx                  # Landing: hero, search, stats, top faults
    defects/page.tsx          # pSEO hub (filterable via searchParams)
    defects/[make]/[model]/[year]/[fuelType]/[engine]/page.tsx  # pSEO vehicle profile
    about/                     # Real "about" page
    login/, auth/callback/     # Google OAuth login flow
    profile/                   # Account settings, saved vehicles, danger zone
    garage/                    # Signed-in user's saved vehicles + known issues
    privacy/                   # Privacy policy
    admin/**                   # Admin panel: vehicles, known issues, fixes (role=admin only)
    not-found.tsx
  sitemap.ts
  robots.ts
components/
  ui/          # shadcn primitives (unmodified API)
  header/      # site-header, mobile-nav, locale-switcher, user-menu
  footer/      # site-footer, social-links, cookie-settings-button
  home/        # hero-section, vehicle-search-form, stats-bar
  faults/      # fault-card, fault-card-grid
  vehicle/     # vehicle-hero, known-issues-accordion, reviews, comments, fixes
  garage/      # garage-hero, garage-vehicle-list, garage-known-issues
  admin/       # vehicle-model-form, known-issue-form, fix-list
  ads/         # adsense-unit, adsense-script
  cookies/     # cookie consent banner + provider
  brand/       # logo
i18n/          # next-intl routing, navigation and request config
messages/      # pt-PT/, en-GB/, es-ES/ — one JSON file per namespace
lib/api/       # car-faults-api client (fetch wrappers per resource)
lib/mocks/     # make/model autocomplete data for the home search form only
types/
```

## MVP / What this app does

1. Lookup by make, model, year, and engine (delegated to `car-faults-api`)
2. Display `known_issues` + `tech_specs` for a vehicle
3. Google login (via the API)
4. Reviews and comments on issues
5. Fixes: a curated catalog per known issue that users can upvote/downvote — not user-submitted
6. Vehicle photos: uploaded by admins only (`components/admin/vehicle-model-form.tsx`), not by garage owners

AI content is marked as generated, and product copy should treat results as indicative — not a substitute for a mechanic.

## How it fits

```mermaid
flowchart LR
  Browser --> Web[car-faults-web]
  Web -->|"REST"| Nest[car-faults-api]
  Nest --> Py[car-faults-ai-api]
```

This app never talks to `car-faults-ai-api` directly — all AI-derived content flows through the Nest API.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Agent skills are optional: they're defined in `skills-lock.json` and installed into `.agents/` (gitignored) via `npx skills update`, not required to run or build the app.

### Environment variables

See [.env.example](.env.example) for the full list. Summary:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `car-faults-api` base URL (no trailing slash) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, used for sitemap/robots |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile widget sitekey (siteverify happens only in the API) |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Google AdSense publisher id; leave unset to disable ads (dev/local) |
| `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` | Must match `car-faults-api`'s `R2_PUBLIC_BASE_URL` |

### Useful URLs

| Resource | URL |
|----------|-----|
| App | `http://localhost:3000` |
| API (default local port, see `car-faults-api/.env.example`) | `http://localhost:3001` |

### Development workflow

Before committing or opening a pull request, always run:

```bash
npm run lint   # check code style and ESLint rules
npm run test   # run unit tests
npm run build  # verify the production build
```

## Tests

```bash
npm run test      # unit tests
npm run test:cov  # with coverage report and 90% gate
```

Global coverage (statements, branches, functions, lines) must stay at **90%+**. PRs and pushes to `main` run `npm run test:cov` in CI and fail below that threshold.

## License

Proprietary — All Rights Reserved (Daniel Fonseca da Silva). See [LICENSE](LICENSE).
Use and run allowed; modification and derivative works require written permission.

You may use and run this software. You may **not** modify it or create derivative works without prior written permission from the copyright holder.
