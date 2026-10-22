# Driveo Exclusive — Website (frontend)

Marketing and booking-request website for Driveo Exclusive's private chauffeur service.
It is built from the approved Lovable design and talks to the shared Django REST API.

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · GSAP · Zod

> Part of the Driveo Exclusive platform. Project status, architecture, decisions and the changelog
> live in the [root README](../README.md). This file covers working on the website itself.

## Getting started

```bash
cp .env.example .env.local   # then adjust values
npm install
npm run dev                  # http://localhost:3000 → redirects to /en
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (standalone output) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Environment

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public origin. Used for canonical URLs, hreflang, sitemap and Open Graph. |
| `NEXT_PUBLIC_API_BASE_URL` | Django API base, e.g. `https://api.example.com/api` |
| `NEXT_PUBLIC_API_MOCK` | `true` answers API calls locally. This is also the default when no API URL is set. |

`NEXT_PUBLIC_*` values are inlined at build time, so rebuild the image after changing them.

## Project structure

```
src/
├── app/                      # Routing only: layouts, pages, metadata routes
│   ├── [locale]/             # Root layout per language (en, fr, bg, ar), statically generated
│   │   ├── page.tsx          # Home page: composes feature sections
│   │   ├── not-found.tsx     # Localized 404
│   │   └── [...rest]/        # Sends unknown paths to the 404
│   ├── fonts.ts              # next/font (self-hosted Google fonts)
│   ├── manifest.ts · robots.ts · sitemap.ts
├── proxy.ts                  # Redirects "/" to the visitor's language (cookie → Accept-Language)
├── components/               # Shared, feature-agnostic building blocks
│   ├── ui/                   # Button, Eyebrow …
│   ├── layout/               # SiteHeader, SiteFooter, LanguageSwitcher
│   ├── brand/ · icons/
│   └── motion/               # GSAP setup, <Reveal>, <ParallaxSurface>
├── features/                 # Self-contained product areas
│   ├── home/                 # Hero, assurance, services, cities, process, testimonial
│   ├── fleet/                # Fleet cards + media config
│   ├── quote/                # Quote form: schema, API client, hooks, context, UI
│   └── pwa/                  # "Add to Home Screen"
├── domain/booking.ts         # Cities, services, vehicles, capacity rules (stable API ids)
├── i18n/                     # Locale config + typed dictionaries
├── lib/                      # http client, SEO helpers, cn()
├── config/                   # env + site constants (contact, socials, assets)
└── styles/globals.css        # Design tokens, base styles, shared primitives
```

### Conventions

- **Server Components by default.** Interactivity lives in small client islands, such as the
  language switcher, hero video, quote form and parallax surfaces. Each island receives only
  the dictionary slice it needs as props.
- **Styling.** Design tokens are CSS variables exposed to Tailwind via `@theme`. Use Tailwind
  utilities for layout. Use co-located CSS Modules for complex effects such as 3D planes,
  orbits and the light-on-dark form. Use logical properties (`ps-*`, `inset-inline-*`) so RTL works.
- **i18n.** Add a language by adding it to `i18n/config.ts` and creating a dictionary typed
  as `Dictionary`. The compiler then flags any missing keys.
- **Domain ids vs labels.** Values sent to the API are stable snake_case ids from
  `domain/booking.ts`. Labels come from the dictionaries.
- **Motion.** GSAP runs only under `prefers-reduced-motion: no-preference`. The server-rendered
  content is fully visible without JavaScript.

## Backend contract

The quote form sends `POST {NEXT_PUBLIC_API_BASE_URL}/v1/quote-requests/` with JSON:

```json
{
  "first_name": "Ada", "last_name": "Lovelace", "email": "ada@example.com", "phone": "+44 20 7946 0000",
  "city": "london", "service_type": "airport_transfer", "vehicle_class": "first_class",
  "pickup_location": "Heathrow T5", "destination": "Mayfair", "hire_hours": null,
  "journey_date": "2026-11-02", "journey_time": "09:30",
  "passengers": 2, "luggage": 2, "notes": "BA117", "locale": "en", "honeypot": ""
}
```

- Enums: `city` ∈ london | paris | bulgaria | dubai. `service_type` ∈ airport_transfer |
  point_to_point | hourly_hire | private_event. `vehicle_class` ∈ business_class |
  first_class | business_van | please_advise.
- For `hourly_hire`, `hire_hours` is 2–16 and `destination` is empty.
- Capacity: business_van takes 7 passengers and 8 luggage items. Every other class takes 4 and 3.
- A non-empty `honeypot` means a bot. Reject it silently.
- Expected response: `201 { "reference": "DRV-XXXXXX" }`. The form shows that reference.
- CORS must allow the website origin.

Types and the mapping live in `src/features/quote/api/submit-quote-request.ts`.
The client-side rules live in `src/features/quote/schema.ts`.

## Docker

```bash
docker build -t driveo-frontend \
  --build-arg NEXT_PUBLIC_SITE_URL=https://driveoexclusive.com \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://driveoexclusive.com/api .
docker run -p 3000:3000 driveo-frontend
```

The image runs the standalone Next.js server as a non-root user on port 3000, ready to sit
behind Nginx in the platform's Docker Compose setup.
