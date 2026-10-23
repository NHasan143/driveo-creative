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
npm run dev                  # http://localhost:3000 → redirects to /?lang=en
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (standalone output) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

> **Don't run `npm run build` while `npm run dev` is running.** Both write to `.next/`, and the
> dev server's cache gets corrupted. The symptoms are pages reloading in a loop and
> "Unexpected end of JSON input" errors. If it happens, stop the dev server, delete `.next/`
> and start it again.

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
│   │   ├── (site)/           # Public pages sharing header, footer and quote pre-fill state
│   │   │   ├── layout.tsx    # SiteHeader + SiteFooter + QuotePresetProvider
│   │   │   ├── page.tsx      # Home  → /?lang=xx
│   │   │   ├── services/     # /services?lang=xx
│   │   │   ├── fleet/        # /fleet?lang=xx
│   │   │   ├── cities/       # /cities?lang=xx
│   │   │   └── process/      # /process?lang=xx
│   │   ├── not-found.tsx     # Localized 404 (outside (site), no header)
│   │   └── [...rest]/        # Sends unknown paths to the 404
│   ├── fonts.ts              # next/font (self-hosted Google fonts)
│   ├── manifest.ts · robots.ts · sitemap.ts
├── proxy.ts                  # Language routing: "/?lang=fr" is served from app/[locale] (rewrite)
├── components/               # Shared, feature-agnostic building blocks
│   ├── ui/                   # Button, Eyebrow, ArrowLink, CheckList …
│   ├── layout/               # SiteHeader, MainNav, SiteFooter, LanguageSwitcher
│   ├── page/                 # PageHero, SectionHeading (inner-page building blocks)
│   ├── brand/ · icons/
│   └── motion/               # GSAP setup, <Reveal>, <ScrollFade>, <ParallaxSurface>
├── features/                 # Self-contained product areas
│   ├── home/                 # Hero, assurance, services, cities, process, testimonial
│   ├── services/             # Services page: per-service details
│   ├── fleet/                # Fleet cards, showcase, comparison table, media config
│   ├── cities/               # Cities page: city directory
│   ├── process/              # Process page: timeline, request checklist
│   ├── quote/                # Quote form: schema, API client, hooks, pre-fill context, UI
│   └── pwa/                  # "Add to Home Screen"
├── domain/booking.ts         # Cities, services, vehicles, capacity rules (stable API ids)
├── i18n/                     # Locale config + typed dictionaries
├── lib/                      # http client, SEO helpers, cn()
├── config/                   # env, site constants, navigation (page list)
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
  - **URLs:** the public form is a query parameter: `/?lang=en`, `/?lang=fr`, `/?lang=bg`, `/?lang=ar`.
    Internally each language is still a statically generated `app/[locale]` route. `proxy.ts`
    rewrites `/?lang=fr` to `/fr` without changing the address bar, and redirects everything else
    to that form:

    | Request | Result |
    | --- | --- |
    | `/` | 307 → `/?lang=<cookie, else Accept-Language, else en>` |
    | `/?lang=bg` | 200, Bulgarian page (choice saved in the `NEXT_LOCALE` cookie) |
    | `/?lang=EN`, `/?lang=xx` | 307 → normalized or detected language |
    | `/bg`, `/fr/x` (old path links) | 307 → `/?lang=bg`, `/x?lang=fr` |

  - **Building links:** use `localePath(locale)` from `i18n/config.ts`, or `localeUrl()` in
    `lib/seo/metadata.ts` for absolute URLs. Don't read `usePathname()` for language logic: on
    rewritten pages it returns the internal path and can cause hydration mismatches.
  - **Switcher:** the language switcher (`components/layout/language-switcher.tsx`) is a dropdown of
    real links, each labelled with the language's own name (`localeMeta[code].label`). It supports
    keyboard navigation (arrow keys, Home/End, Escape) and keeps the scroll position when the
    language changes.
- **Adding a page:**
  1. Create `app/[locale]/(site)/<segment>/page.tsx`. Start with `<PageHero>` and end with `<QuoteSection>`,
     so the header's "Request quote" link always has a target.
  2. Add its copy under `pages.<key>` in every dictionary. The compiler flags missing keys.
  3. Export `generateMetadata` using `buildPageMetadata(locale, meta, "/<segment>")`.
  4. Add it to `SITE_PAGES` in `config/navigation.ts`. The header, footer and sitemap pick it up from there.
- **Active page:** navigation reads `useSelectedLayoutSegment()`, not the URL, because the `?lang=`
  rewrite makes `usePathname()` unreliable.
- **Quote pre-fill:** `<RequestQuoteButton preset={{ vehicle | city | service }}>` fills the form and
  scrolls to it. Next.js keeps recently visited pages mounted but hidden (React `<Activity>`), so
  there can be several `#quote` sections; the scroll targets the visible one.
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
