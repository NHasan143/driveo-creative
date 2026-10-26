# Driveo Exclusive — Website (frontend)

Marketing and booking-request website for Driveo Exclusive's private chauffeur service.
It is built from the approved Lovable design and talks to the shared Django REST API.
The same app also serves the **content admin** at `/admin` (see [Content admin](#content-admin-admin)).

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · GSAP · Zod

> Part of the Driveo Exclusive platform. Project status, architecture, decisions and the changelog
> live in the [root README](../README.md). This file covers working on the website itself.

## Getting started

```bash
cp .env.example .env.local   # then adjust values
npm install
npm run dev                  # http://localhost:3000 → redirects to /?lang=en
                             # http://localhost:3000/admin → content admin
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
| `NEXT_PUBLIC_ADMIN_CONTENT_SOURCE` | Where `/admin` keeps content. `local` (default): demo mode in this browser, no sign-in. `api`: the Django content API with staff sign-in. |
| `ADMIN_ENABLED` | Server-side, read at runtime. `/admin` is always on in development. Production answers 404 there unless this is `true`. Turn it on only together with `NEXT_PUBLIC_ADMIN_CONTENT_SOURCE=api`. |

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
│   │   │   │   └── [service]/  # /services/airport-transfer?lang=xx … (4 detail pages)
│   │   │   ├── fleet/        # /fleet?lang=xx
│   │   │   ├── cities/       # /cities?lang=xx
│   │   │   └── process/      # /process?lang=xx
│   │   ├── not-found.tsx     # Localized 404 (outside (site), no header)
│   │   └── [...rest]/        # Sends unknown paths to the 404
│   ├── admin/                # Content admin: its own root layout (no languages), /admin/...
│   ├── fonts.ts              # next/font (self-hosted Google fonts)
│   ├── manifest.ts · robots.ts · sitemap.ts
├── proxy.ts                  # Language routing: "/?lang=fr" is served from app/[locale] (rewrite); /admin passes through
├── admin/                    # Content admin code (components, features, lib, styles), see below
├── components/               # Shared, feature-agnostic building blocks
│   ├── ui/                   # Button, Eyebrow, ArrowLink, CheckList …
│   ├── layout/               # SiteHeader, MainNav, SiteFooter, LanguageSwitcher
│   ├── page/                 # PageHero, SectionHeading (inner-page building blocks)
│   ├── brand/ · icons/
│   └── motion/               # GSAP setup, <Reveal>, <ScrollFade>, <ParallaxSurface>
├── features/                 # Self-contained product areas
│   ├── home/                 # Hero, assurance, services, cities, process, testimonial
│   ├── services/             # Services page rows + detail/ (hero card, facts, overview, steps, fleet, cross-links)
│   ├── fleet/                # Fleet cards, showcase, comparison table, media config
│   ├── cities/               # Cities page: city directory
│   ├── process/              # Process page: timeline, request checklist
│   ├── quote/                # Quote form: schema, API client, hooks, pre-fill context, UI
│   └── pwa/                  # "Add to Home Screen"
├── domain/booking.ts         # Cities, services, vehicles, capacity rules (stable API ids)
├── i18n/                     # Locale config + typed dictionaries
├── lib/                      # http client, SEO helpers, cn()
├── config/                   # env, site constants, navigation (page list), services (slugs, media)
└── styles/globals.css        # Design tokens, base styles, shared primitives
```

## Content admin (`/admin`)

Editors create, update, publish and delete the website's **services** (cards and full service pages),
**fleet** (vehicle classes with capacity, photo and features), **cities** (with the services offered) and
**site settings** (company, contact, social links, testimonials). Every customer-facing text has
EN, FR, BG and AR versions. English is required; the others fall back to English until translated.

> **Two modes** (`NEXT_PUBLIC_ADMIN_CONTENT_SOURCE`, see [Environment](#environment)):
>
> - **`api`**: content is saved in Postgres through the Django content API (`backend/content/`). Editors
>   sign in with a Django staff account; the API refuses every content request without one.
> - **`local`** (default): demo mode. Content is stored in the editor's browser (IndexedDB), starting
>   from the website's current copy, with no sign-in.
>
> Either way, the website doesn't read this content yet. Production hides `/admin` unless `ADMIN_ENABLED=true`.

**How it fits into the website app**

- `app/admin/layout.tsx` is a second root layout beside `app/[locale]`. Website pages never load admin
  code or CSS, and the admin never loads website CSS. Moving between the two is a full page load.
- `proxy.ts` lets `/admin` through without the `?lang=` redirect. It also enforces the production gate.
- The admin has its own design system in `src/admin/styles/admin.css`, with light and dark themes.
  Its Tailwind build scans only admin files, and `styles/globals.css` excludes them.
- `/admin` is disallowed in `robots.txt`, sent with `X-Robots-Tag: noindex`, and absent from the sitemap.
- Pages are client-rendered. The parts that read the URL (sidebar active link, `[id]` editors) sit
  in `<Suspense>`, so Cache Components can prerender their shells.

**Using it**

- **Dashboard:** counts, translation progress per language, a "Needs attention" list (drafts,
  missing translations, services without vehicles, cities without services), recent edits and shortcuts.
- **Lists:** search, status filter, and reordering (arrows on desktop; "Move up/down" in the row menu on phones).
  Row actions are Edit, Publish/Unpublish, Duplicate and Delete. Delete asks first and cleans up references,
  for example removing a deleted vehicle from the services that recommend it.
- **Editors:**
  - The language tabs switch every text field at once and show how complete each language is.
  - Non-English fields show the English text as a reference. Arabic fields are right-to-left.
  - If a save fails validation, the editor jumps to the first problem, switching language if needed.
  - Closing or reloading the tab with unsaved changes asks first. Moving to another admin page doesn't yet.
- **Images:** upload or drag in a photo, which is resized to at most 1920px and saved as JPEG, or pick one from `public/media`.
  In `api` mode the photo is uploaded to the Neon `assets` bucket when the record is saved.
- **Sign-in (`api` mode):** `components/auth/auth-gate.tsx` shows a sign-in screen until a staff member is
  signed in, and a Sign out button in the header. An expired session brings the sign-in screen back.
- **Original content:** Settings has a button that loads the website's built-in copy (`seed.ts`). In demo mode
  it resets the browser store; in `api` mode it replaces all content in the database (superusers only), which
  is how a new database gets its first content.

**Code**

```
src/admin/
├── components/
│   ├── ui/        # Button, Input, Field, Card, Badge, Switch, Menu, ConfirmDialog …
│   ├── layout/    # App shell (sidebar, phone drawer, theme toggle), page header, nav items
│   ├── form/      # EditorShell, LocalizedField, Repeater, ImageField, SlugField, pickers, SEO preview
│   └── content/   # CollectionList (generic list screen), ItemLoader, TranslationDots
├── features/      # dashboard/, services/, fleet/, cities/, settings/: zod schema, list, editor
├── lib/content/   # Data layer (below)
└── styles/admin.css
```

- **One interface for all data:** `ContentRepository` (`lib/content/repository.ts`), used through the
  TanStack Query hooks in `hooks.ts`. Every write invalidates `["content"]`, so all screens stay in sync.
- `api-repository.ts` talks to the Django API through `lib/admin-api.ts`. That client sends the session
  cookie (`credentials: "include"`), keeps the CSRF token in memory and sends it as `X-CSRFToken`, uploads
  photos picked in the form (data URLs) before saving, and turns DRF `400` errors into `ContentValidationError`
  with the form's field path (`{facts: {"0": {value: {en: [...]}}}}` → `facts.0.value.en`).
- `local-repository.ts` is the IndexedDB implementation for demo mode. It enforces unique slugs and cleans up references.
- `seed.ts` builds the starting content from the website's own dictionaries, `config/` and
  `domain/booking.ts`, so it can't drift from the site.
- `types.ts` is the content model. Ids are the stable domain ids (`airport_transfer`, `business_class`, `london` …).
- `index.ts` picks the implementation from `NEXT_PUBLIC_ADMIN_CONTENT_SOURCE` and exports `IS_LOCAL_DEMO`,
  which the screens use for demo-mode notices.
- **The website reads published services** through `src/lib/content/site-services.ts`:
  - It calls `GET /api/v1/content/published/` inside a `"use cache"` function with `cacheLife("minutes")`
    and `cacheTag("content")`, and falls back to `seed.services` in mock mode or when the API fails.
  - Server code may set `API_INTERNAL_BASE_URL`, for example a Docker service name, in place of the
    public API URL.
  - Built-in services keep their booking id (`airport_transfer`, …), so their quote buttons pre-select
    the service. Services added in the admin open the form with none selected.
  - **Still to do:** fleet, cities and site settings still render from the dictionaries.

  The endpoints are listed in the [root README](../README.md#content-api-backendcontent).

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
- **Service detail pages:** `services/[service]` is prerendered for every slug in `config/services.ts`
  (`SERVICE_SLUGS`), which also sets each page's hero and overview photo and vehicle order. The copy lives in
  `pages.serviceDetail.items.<service>` in each dictionary. Facts must be real: the site states nothing it
  can't back up (no invented statistics, testimonials or prices). The page exports `instant = false` on purpose.
  Wrapping it in `<Suspense>` to satisfy the instant-navigation check would replace the static HTML with a
  placeholder that only fills in after JavaScript runs.
- **Active page:** navigation reads `useSelectedLayoutSegment()`, not the URL, because the `?lang=`
  rewrite makes `usePathname()` unreliable.
- **Header layout:**
  - **Second nav row (below `xl`, 1280px):** the page links sit in a second header row that must stay
    **one line**. Between 1024 and 1279px they don't fit beside the buttons in French or Bulgarian. The
    heroes' top padding assumes the resulting 126px header. The row can't scroll sideways either, because
    that would clip the Services dropdown. Its text size is `clamp(0.55rem, 2.6vw, 0.6rem)` with tight
    tracking so Bulgarian fits at 320px.
  - **Buttons:** the language switcher and the header quote button (`size="compact"`) share the same height,
    type size and tracking. Change them together.
  - **Phones:** below 640px only the logo shows; the company name appears from `sm`.
  - **Fonts:** mono labels fall back to IBM Plex Mono for Cyrillic, because Space Mono has none.
  - If you add a nav item or a longer translation, re-check 320px, 1024px and 1280px in every language.
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
- CORS must allow the website origin (backend `CORS_ALLOWED_ORIGINS`).
- Errors the form understands (see `src/features/quote/hooks/use-quote-submission.ts`):
  - `400` with DRF field errors, e.g. `{"passengers": ["..."]}`. The form lists the matching field labels
    in the visitor's language.
  - `429`: the "too many requests" message.
  - Anything else (network, 5xx): the generic error with the contact email.
- To work on the website without the backend, set `NEXT_PUBLIC_API_MOCK=true` in `.env.local`.

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
