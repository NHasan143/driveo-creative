# Project Context: Driveo Exclusive Platform

> **Read this first.** This file is the single place to understand the project: what we are building,
> why, how, where it stands, and what comes next. It is written for anyone joining the project:
> developers, designers, the client, or an AI assistant picking up the work.
>
> - **Last updated:** 2026-10-23
> - **Current phase:** Phase 1, Website frontend (≈ 85 % done)
> - **Next milestone:** Start Phase 2 (Django API) and connect the quote form to it
>
> The [README](README.md) is the technical entry point (setup, commands, architecture).
> This file is the narrative: goals, plan, progress, risks and decisions.
> Update it whenever any of those change (see [§14](#14-how-to-maintain-this-file)).

---

## Table of contents

1. [The business](#1-the-business)
2. [The problem and the aim](#2-the-problem-and-the-aim)
3. [Objectives and success criteria](#3-objectives-and-success-criteria)
4. [Scope](#4-scope)
5. [Project history](#5-project-history)
6. [The solution at a glance](#6-the-solution-at-a-glance)
7. [Plan: phases and roadmap](#7-plan-phases-and-roadmap)
8. [Work objectives by workstream](#8-work-objectives-by-workstream)
9. [Current progress](#9-current-progress)
10. [Risks, concerns and known issues](#10-risks-concerns-and-known-issues)
11. [Decisions made](#11-decisions-made)
12. [Open questions and blockers](#12-open-questions-and-blockers)
13. [Reference](#13-reference)
14. [How to maintain this file](#14-how-to-maintain-this-file)

---

## 1. The business

**Driveo Exclusive Limited** is a premium private chauffeur service, founded in London.

| | |
| --- | --- |
| **Promise** | "Arrive in absolute silence." Discretion, precision and calm |
| **Brand values** | Discretion · Precision · Silence |
| **Operating cities** | London · Paris · Bulgaria · Dubai |
| **Pricing model** | Every journey is quoted personally as one fixed, all-inclusive price in writing. No surge pricing, no meter |
| **Differentiators** | Vetted, licensed, suited chauffeurs · live flight tracking · immaculate black Mercedes-Benz cars · total privacy |
| **Contact** | +44 330 043 0976 · info@driveoexclusive.com · WhatsApp on the same number |
| **Social** | LinkedIn, TikTok, Snapchat, Facebook, Instagram (links in `frontend/src/config/site.ts`) |

### Services

| Service | What the customer gets |
| --- | --- |
| **Airport transfer** | Flight tracked from wheels-up, meet and greet inside the terminal, 60 minutes of free waiting |
| **Point-to-point** | One fixed price agreed before travel: office to home, restaurant to hotel, city to coast |
| **Hourly hire** | Chauffeur stays with the client for 2–16 hours. Each hour includes 15 miles within Greater London |
| **Private events** | Weddings, premieres and long-distance road journeys, planned and quoted personally |

### Fleet

| Class | Vehicle | Max passengers | Max luggage |
| --- | --- | --- | --- |
| Business Class | Mercedes-Benz E-Class (2026), black | 4 | 3 |
| First Class | Mercedes-Benz S-Class (2026), long wheelbase, black | 4 | 3 |
| Business Van | Mercedes-Benz VLE, black | 7 | 8 |

### Customers

High-net-worth private clients, executives, corporate travel managers, event organisers and international
travellers who need consistent service across cities. The site is offered in **English, French,
Bulgarian and Arabic** to match the markets served.

---

## 2. The problem and the aim

**Today:**
- The business ran on AI-generated prototype websites: first a Base44 site, then a Lovable redesign.
- Quote requests arrive through a form whose backend (Supabase) is tied to the prototype. There is no
  proper operations dashboard, no mobile app and no shared business logic.
- The prototypes can't easily grow into a booking platform with pricing rules, availability, customer
  records and staff permissions.

**The aim** is to build a professional platform the business owns and can grow:

1. **Win clients:** a fast, search-friendly website that matches the premium brand and turns visitors into quote requests.
2. **Never lose a request:** every booking or quote is saved first, then the owner is notified by email and WhatsApp, with automatic retries.
3. **Run operations in one place:** an admin dashboard for vehicles, pricing, availability, customers and incoming requests.
4. **Reach clients on their phones:** Android and iOS apps that use the same backend and rules.
5. **Stay maintainable:** one shared API, clean architecture and automated deployment, so the business can change pricing or policy once and have it apply everywhere.

---

## 3. Objectives and success criteria

| # | Objective | Success criteria (measurable where possible) |
| --- | --- | --- |
| O1 | Premium, on-brand web presence | The website matches the approved Lovable design. Lighthouse Performance ≥ 90 and SEO/Accessibility/Best Practices ≥ 95 on mobile. Works from 320 px to 4K |
| O2 | Multilingual reach | EN, FR, BG and AR fully translated, each indexable at its own URL with hreflang. Arabic renders right-to-left |
| O3 | Reliable lead capture | 100 % of valid quote requests are stored. The owner is alerted by email and WhatsApp within 1 minute. Failed deliveries are logged and retried |
| O4 | Central operations | Staff can manage vehicles, pricing, availability, customers and requests in the dashboard, with role-based permissions |
| O5 | Mobile apps | Android and iOS apps published to the stores, reusing the API contracts and branding |
| O6 | Operational safety | Automated daily database backups, health monitoring, logs, HTTPS everywhere, and tested restores |
| O7 | Maintainability | CI runs lint, typecheck, tests and build on every PR. Deployments are repeatable through GitHub Actions. Documentation is kept current |
| O8 | Privacy and compliance | Personal data is handled in line with UK GDPR/GDPR: privacy policy, consent for non-essential cookies, data minimisation |

---

## 4. Scope

### In scope (v1)

- Public website: marketing pages, quote request form, four languages, SEO, PWA install.
- Shared Django REST API, versioned under `/api/v1`.
- Admin dashboard (Django): vehicles, pricing rules, availability, customers, requests, users and permissions.
- Notifications: transactional email and Twilio WhatsApp to the business owner, with logging and retries.
- Android and iOS apps (React + Capacitor) for browsing services and requesting bookings or quotes.
- Hosting: Docker Compose on a Linux VPS behind Nginx and Cloudflare, with CI/CD on GitHub Actions.
- Operations: backups, logging and monitoring.

### Out of scope (v1), unless agreed later

- Online card payments and automated invoicing.
- Live driver tracking or a driver app.
- Automatic instant pricing. v1 pricing is quoted by a person.
- High-availability or multi-server infrastructure.
- Third-party service fees (hosting, email, WhatsApp/Twilio, app store accounts), which are paid separately by the client.

---

## 5. Project history

| When | Event |
| --- | --- |
| Before 2026-09 | First website generated with Base44 (`driveo-elite-flow.base44.app`), the source of company info and branding |
| 2026-09-11 → 09-12 | Lovable prototype built (`driveo-creative-lab.lovable.app`): 3D quote experience, then email-only quotes and social links. Code in `driveo-creative/` |
| — | Technical proposal agreed: *Technology Stack & Deployment Architecture* v1.0 (Next.js website, Capacitor apps, Django API, PostgreSQL/Redis/Celery, Docker on VPS) |
| 2026-10-22 | `frontend/` created: Next.js rebuild of the Lovable design with the full architecture. README, `.gitignore` files and this context file added |

---

## 6. The solution at a glance

```
Website (Next.js) ─┐
Android/iOS apps ──┼──► Shared Django REST API ──► PostgreSQL
Admin dashboard ───┘           │
                               └──► Celery + Redis ──► Email · Twilio WhatsApp
```

- **Hosting:** Cloudflare (DNS, CDN, TLS) → Nginx → containers (Next.js, Django, Celery, PostgreSQL, Redis) on one VPS.
- **Repository layout:** `frontend/` (built) · `backend/`, `mobile/`, `infra/` (planned) · `driveo-creative/` (reference only, separate git repo, ignored).
- **Full stack table, diagrams and setup:** [README.md](README.md).

---

## 7. Plan: phases and roadmap

Dates are not set yet. Fill them in once scope, budget and resources are confirmed.

| Phase | Goal | Main deliverables | Depends on | Status |
| --- | --- | --- | --- | --- |
| **0. Discovery and design** | Agree the brand, design and stack | Lovable prototype, technical proposal | — | 🟢 Done |
| **1. Website frontend** | Production-quality website on mock data | `frontend/` Next.js app, i18n, SEO, Dockerfile | 0 | 🟡 ≈ 85 % |
| **2. Backend API and admin** | Shared business logic and operations dashboard | Django project, data model, quote/booking API, admin, auth, OpenAPI schema | 0 | ⚪ Not started |
| **3. Notifications** | Owner alerts that never lose a request | Celery tasks, email provider, Twilio WhatsApp, retry and failure logging | 2 | ⚪ Not started |
| **4. Integration** | Website talks to the real API | Quote form live, CORS, error handling, end-to-end tests | 1, 2 | ⚪ Not started |
| **5. Infrastructure and CI/CD** | Repeatable, secure deployments | `infra/` docker-compose, Nginx, Cloudflare, GitHub Actions, backups, monitoring | 1, 2 | ⚪ Not started (frontend Dockerfile ready) |
| **6. Mobile apps** | Android and iOS apps | `mobile/` React + Vite + Capacitor app, store listings | 2 | ⚪ Not started |
| **7. Launch and handover** | Go live and hand over safely | Production launch, legal pages, analytics, runbook, client training | 3, 4, 5 | ⚪ Not started |

**Critical path:** Phase 2 (API) → Phase 3 (notifications) and Phase 4 (integration) → Phase 5 (deploy) → launch.
The mobile apps (Phase 6) can follow after launch, because they reuse the same API.

---

## 8. Work objectives by workstream

Each objective has a definition of done (DoD). Tick it when it's done, and update §9.

### WS1: Website (`frontend/`)

- [x] **W1.1 Port the design.** DoD: every Lovable section rebuilt, and section heights at 1440 px match the original within a few pixels.
- [x] **W1.2 Internationalisation.** DoD: every language is statically generated and served at `/?lang=en|fr|bg|ar`. Bare `/` picks the language from the cookie, then Accept-Language. Old `/en` links redirect. The dropdown shows each language in its own script. Arabic is right-to-left. A missing translation key fails the build.
- [x] **W1.3 SEO.** DoD: per-locale metadata, canonical, hreflang, sitemap, robots, LocalBusiness JSON-LD, manifest.
- [x] **W1.4 Quote form (client side).** DoD: validation, vehicle capacity limits, hourly-hire flow, honeypot, typed API client, mock mode.
- [x] **W1.5 Motion.** DoD: GSAP scroll reveals and hero fade plus CSS 3D parallax, all disabled under `prefers-reduced-motion`.
- [x] **W1.6 Container.** DoD: multi-stage Dockerfile, standalone output, non-root user, healthcheck.
- [ ] **W1.7 Legal pages.** DoD: privacy policy, terms and cookie policy in four languages, linked from the footer.
- [ ] **W1.8 Consent and analytics.** DoD: consent banner (non-essential cookies off by default), analytics only after consent.
- [ ] **W1.9 Performance pass.** DoD: hero videos compressed and served in modern formats, poster-first loading on mobile, Lighthouse targets from O1 met.
- [ ] **W1.10 Automated tests.** DoD: unit tests for the schema, DTO mapping and proxy locale logic. Playwright end-to-end tests for the language switch, the fleet → quote preselection and quote submission.
- [ ] **W1.11 Accessibility audit.** DoD: WCAG 2.1 AA check (contrast, keyboard, screen-reader labels) with issues fixed.
- [x] **W1.12 Inner pages.** DoD: Services, Fleet, Cities and Process pages in four languages, matching the home design. Each has a page hero, its own content, and the quote form with matching pre-fill. Nav shows the active page, links are in the footer and sitemap, and each page has its own metadata and hreflang.

### WS2: Backend API and admin (`backend/`)

- [ ] **W2.1 Project setup.** DoD: Django + DRF project, settings per environment, `.env.example`, Dockerfile, linting (ruff), tests (pytest).
- [ ] **W2.2 Data model.** DoD: models for City, Service, VehicleClass (with capacity), QuoteRequest/Booking (with status lifecycle and reference `DRV-XXXXXX`), Customer, PricingRule, Availability, NotificationLog.
- [ ] **W2.3 Quote request endpoint.** DoD: `POST /api/v1/quote-requests/` matches the contract in `frontend/README.md`. It validates the capacity and hourly rules, rejects honeypot submissions silently, rate-limits, and returns `201 {reference}`.
- [ ] **W2.4 Admin dashboard.** DoD: staff can list, filter and update requests and manage vehicles, pricing and availability. Roles and permissions are in place.
- [ ] **W2.5 API documentation.** DoD: OpenAPI schema published (drf-spectacular) and linked from the README.
- [ ] **W2.6 Security.** DoD: CORS limited to known origins, HTTPS-only cookies, admin protected, dependency audit clean.

### WS3: Notifications

- [ ] **W3.1 Async pipeline.** DoD: saving a request queues a Celery task. The customer response never waits on providers.
- [ ] **W3.2 Email.** DoD: the owner receives a formatted request email from a verified sender domain.
- [ ] **W3.3 WhatsApp.** DoD: the owner receives a Twilio WhatsApp alert.
- [ ] **W3.4 Reliability.** DoD: failures are logged in NotificationLog, retried with backoff, and staff can see them in the admin.

### WS4: Infrastructure and DevOps (`infra/`)

- [ ] **W4.1 Compose stack.** DoD: `docker-compose.yml` with frontend, backend, worker, PostgreSQL, Redis and Nginx, plus health checks.
- [ ] **W4.2 Edge.** DoD: Cloudflare DNS, HTTPS, security headers, and caching for static media.
- [x] **W4.3a CI/CD workflows (frontend).** DoD: `frontend-ci.yml` runs lint, typecheck, build and a Docker build check on PRs. `frontend-deploy.yml` verifies `main`, publishes the image to GHCR and deploys over SSH with a smoke test. It refuses mock-mode deploys. _Validated with actionlint._ (Dependabot was added here and removed on 2026-10-24.)
- [ ] **W4.3b CI/CD activation.** DoD: repository pushed to GitHub, `production` environment variables and secrets set, branch protection requires "Frontend CI / Lint, typecheck & build", and the first green deploy is done.
- [ ] **W4.3c CI for backend and mobile.** DoD: `backend-ci.yml`/`mobile-ci.yml` following the same pattern, with tests.
- [ ] **W4.4 Backups.** DoD: automated daily PostgreSQL backups stored off the server, and a restore tested and documented.
- [ ] **W4.5 Monitoring.** DoD: uptime checks, error tracking and central logs, with alerts sent to the owner or developer.
- [ ] **W4.6 Staging environment.** DoD: a separate staging deployment for review before production.

### WS5: Mobile apps (`mobile/`)

- [ ] **W5.1 App shell.** DoD: React + Vite + TypeScript + Capacitor project with branding, four languages and right-to-left support.
- [ ] **W5.2 Core flows.** DoD: browse services and fleet, submit a quote or booking via the shared API, see confirmation and reference.
- [ ] **W5.3 Store release.** DoD: signed Android (AAB) and iOS builds, store listings, privacy labels.

### WS6: Project management and documentation

- [x] **W6.1 README.** Platform overview and setup.
- [x] **W6.2 This context file.**
- [x] **W6.3 Ignore rules.** Root and frontend `.gitignore`.
- [ ] **W6.4 Version control.** DoD: git repository initialised at the root, pushed to GitHub, `main` protected, PR template.
- [ ] **W6.5 Runbook and handover.** DoD: deploy, rollback, backup-restore and "notification failed" procedures written. Client trained on the dashboard.

---

## 9. Current progress

_Snapshot as of 2026-10-22._

### Overall

| Workstream | Progress | Notes |
| --- | --- | --- |
| WS1 Website | ███████████████░░░ ≈ 85 % | Feature-complete on mock data. Legal, consent, performance, tests and the accessibility audit remain |
| WS2 Backend | ░░░░░░░░░░░░░░░░░░ 0 % | Contract for the first endpoint is specified |
| WS3 Notifications | ░░░░░░░░░░░░░░░░░░ 0 % | Recipient details to confirm (§12) |
| WS4 Infrastructure | ████░░░░░░░░░░░░░░ ≈ 20 % | Frontend Dockerfile and CI/CD workflows written. Activation waits on git, GitHub and a server |
| WS5 Mobile | ░░░░░░░░░░░░░░░░░░ 0 % | Waits for the API |
| WS6 Docs and PM | ██████████░░░░░░░░ ≈ 60 % | README, context file and ignore rules done. Git not initialised |

### What exists and works today

- `frontend/` runs locally (`npm run dev`) and passes `lint`, `typecheck` and `build`.
- Every page section, all four languages, the language switcher, the right-to-left Arabic layout, the localized 404, the sitemap, robots, manifest and JSON-LD.
- Quote form: validation, fleet → form vehicle preselection, capacity limits, hourly-hire flow. Submission returns a mock reference (`DRV-XXXXXX`).
- Verified in a browser: section heights match the original Lovable site at 1440 px, there is no horizontal overflow at 375 px, the console is clean, and 404 pages return status 404.

### What does not work yet

- No real backend, so quote requests are **not** delivered to anyone yet. The site must not go live until Phase 4 is done.
- No automated tests. The CI/CD workflows exist but have never run on GitHub, and no server is configured.
- The Docker image hasn't been built locally yet: Docker Desktop wasn't running. CI checks the build on every PR.
- No git repository, so the workflows can't run until the project is pushed to GitHub.

### Recently completed

- 2026-10-24: Service detail pages for all four services in four languages, with the form pre-filled per service and vehicle.
- 2026-10-24: Services dropdown in the header (Naymul Hasan). Fixed the phone nav row wrapping in Bulgarian and French, which made the header cover the homepage logo.
- 2026-10-23: Services, Fleet, Cities and Process pages (four languages, quote pre-fill per service, vehicle and city).
- 2026-10-23: Language dropdown (endonyms, matches the button, keyboard support, keeps scroll position). Public URLs switched to `/?lang=xx`.
- 2026-10-23: Git repository set up on GitHub (`NHasan143/driveo-creative`); `main` now holds the new platform.
- 2026-10-22: GitHub Actions CI/CD for the website (PR checks, GHCR image, SSH deploy with safety rails) and Dependabot.
- 2026-10-22: Next.js frontend built, verified and documented. Root README, `.gitignore` files and this file added.

### Next up (in priority order)

1. Activate CI/CD: `production` environment, secrets, branch protection on `main` (W4.3b, W6.4).
2. Resolve the open questions in §12 that block the backend (notification recipients, email provider, accounts in v1).
3. Start the backend: project setup, data model and the quote-request endpoint (W2.1–W2.3).
4. Connect the website to the real endpoint, then add end-to-end tests (Phase 4, W1.10).
5. Write the legal pages and consent banner (W1.7–W1.8), then do the performance pass (W1.9).

---

## 10. Risks, concerns and known issues

### Risks

| Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- |
| Website launched before the backend is live, so leads are lost | High | Low | Mock mode is for development only. The deploy pipeline refuses mock-mode builds unless `ALLOW_MOCK_DEPLOY=true` (preview only). The launch checklist also requires a working end-to-end test |
| Single-VPS hosting has no high availability | Medium | Low–Medium | Accepted for launch (per proposal). Containers make it easy to move to bigger or separate hosts. Backups and monitoring are required |
| Notification provider outage | Medium | Medium | Save first, notify later. Retries with backoff and failure logs visible in the admin |
| Spam or abuse of the quote form | Medium | Medium | Honeypot and client throttle now. Server rate limiting and validation in W2.3. Add CAPTCHA only if needed |
| Personal-data compliance (UK GDPR/GDPR) | High | Medium | Privacy policy, consent banner, data minimisation, retention policy, access restricted to staff |
| Third-party costs not budgeted (hosting, Twilio, email, app stores) | Medium | Medium | Listed as client costs in scope (§4). Confirm budget before Phase 3, 5 and 6 |
| Scope creep (payments, driver app, instant pricing) | Medium | Medium | Out of scope for v1 (§4). New requests go through a recorded decision |
| Translations not reviewed by native speakers | Medium | Medium | Get FR, BG and AR copy reviewed by native speakers before launch |

### Known issues and technical debt

- **No automated dependency updates** since Dependabot was removed. Run `npm outdated` monthly and update deliberately. Pending: align `@types/node` (now `^20`) with the Node 24 runtime, and plan the move to Node 26 LTS.
- **Large hero videos** (≈ 3.4 MB and ≈ 9.9 MB MP4): slow on mobile data. Fix in W1.9.
- **Client-side throttling only** (30 s cooldown, 5 submissions per visit): needs server-side rate limiting (W2.3).
- **Placeholder copy:** the testimonial is the design's sample quote. Replace it with a real, approved client quote.
- **The hourly-hire note** mentions Greater London only. Confirm the rule for the other cities (§12).
- **Copyright year** (`© 2026`) is fixed in the dictionaries. Make it dynamic or update it yearly.
- **Arabic typography:** Fraunces has no Arabic glyphs, so Arabic headings fall back to Noto Kufi Arabic. Get a designer to review.

---

## 11. Decisions made

Newest first. The README has the same log for developers. Keep the two in sync.

| Date | Decision | Why | Alternatives considered |
| --- | --- | --- | --- |
| 2026-10-22 | CI/CD on GitHub Actions: GHCR images, SSH + `docker compose` deploy, mock-mode deploys blocked | No paid CI/CD or registry services; fits the Docker/VPS plan; protects against launching without a backend | Self-hosted runner on the VPS; a PaaS (e.g. Vercel) for the website |
| 2026-10-22 | `driveo-creative/` kept as a read-only reference and git-ignored | Separate repository and stack; avoids accidental commits | Git submodule (unnecessary for a reference) |
| 2026-10-22 | Website rebuilt in Next.js, not extended from Lovable | Matches the agreed stack; better SEO and maintainability | Keep TanStack Start + Supabase |
| 2026-10-24 | Removed Dependabot; dependencies are updated manually | Automated PRs were noisy, and some were unsuitable (EOL Node 25, TypeScript 7 unsupported by the linter) | Keep it in a quieter mode (monthly, minor/patch only); security-only updates |
| 2026-10-23 | Public language URLs use a query parameter (`/?lang=en`) instead of `/en` paths | Client preference. Pages stay prerendered (proxy rewrite) and indexable via canonical/hreflang. Old `/en` links redirect | Keep `/en` path URLs (Google's general recommendation) |
| 2026-10-22 | Language in the URL with a cookie to remember the choice | Each language can be indexed by search engines; shareable links | Client-only language switch (prototype approach) |
| 2026-10-22 | API uses stable snake_case ids; labels live in translations | Labels can change or be translated without breaking data | Sending display text (prototype approach) |
| 2026-10-22 | Frontend mock mode until the API exists | Frontend and backend can be built in parallel | Wait for the backend |
| 2026-10-22 | Styling: Tailwind for layout, CSS Modules for complex effects, tokens as CSS variables | Faithful port of the custom design while staying maintainable | Rewrite every effect as Tailwind utilities |
| Proposal v1.0 | Django + DRF shared API; PostgreSQL, Redis, Celery; Docker on VPS | Proven, secure, one place for business rules | — |

---

## 12. Open questions and blockers

| # | Question | Blocks | Owner | Status |
| --- | --- | --- | --- | --- |
| Q1 | Who receives quote alerts? The prototype used email only to `driveolimited@gmail.com`; the proposal says email and WhatsApp. Confirm the address(es) and WhatsApp number | W3.2, W3.3 | Client | Open |
| Q2 | Which transactional email provider and sender domain? | W3.2 | Client + dev | Open |
| Q3 | Do customers need accounts in v1, or only anonymous requests? | W2.2, W5.2 | Client | Open |
| Q4 | Production domain, VPS provider and Cloudflare account access | W4.1, W4.2 | Client | Open |
| Q5 | Pricing rules: what may the system calculate vs. what is always quoted by hand? | W2.2 | Client | Open |
| Q6 | Hourly-hire mileage allowance outside London | Website copy, W2.2 | Client | Open |
| Q7 | Legal copy (privacy, terms, cookies). Who writes and approves it? | W1.7 | Client | Open |
| Q8 | Real client testimonial(s) approved for publication | Website copy | Client | Open |
| Q9 | Budget and timeline per phase | §7 dates | Client | Open |
| Q10 | Apple and Google developer accounts (owned by the business) | W5.3 | Client | Open |

---

## 13. Reference

### Key locations

| What | Where |
| --- | --- |
| Website code | `frontend/` (guide: [`frontend/README.md`](frontend/README.md)) |
| Domain rules (cities, services, vehicles, capacity) | `frontend/src/domain/booking.ts` |
| Translations | `frontend/src/i18n/dictionaries/{en,fr,bg,ar}.ts` |
| Company contact, social links, media | `frontend/src/config/site.ts` |
| Quote API contract (payload and response) | [`frontend/README.md#backend-contract`](frontend/README.md#backend-contract) |
| Design reference code | `driveo-creative/` · live: https://driveo-creative-lab.lovable.app |
| Original company site | https://driveo-elite-flow.base44.app |
| Technical proposal | *Technology Stack & Deployment Architecture, DriveExclusive* (PDF, v1.0) |

### Glossary

| Term | Meaning |
| --- | --- |
| **Quote request** | A customer's journey details sent for a personal fixed-price quote |
| **Reference** | Request id shown to the customer, format `DRV-XXXXXX` |
| **Mock mode** | Frontend setting that fakes API responses (`NEXT_PUBLIC_API_MOCK=true`) |
| **Locale** | Language version of the site: `en`, `fr`, `bg`, `ar` |
| **RTL** | Right-to-left layout, used for Arabic |
| **Honeypot** | Hidden form field that only bots fill in, used to drop spam silently |
| **DRF** | Django REST Framework |
| **Capacitor** | Tool that packages a web app as native Android and iOS apps |
| **Celery / Redis** | Background job system and its message broker, used for notifications and retries |
| **PWA** | Progressive Web App: the site can be "installed" to a phone's home screen |

### Working agreements

- **Documentation:** update this file and the README in the same change as the work.
- **Commits:** Conventional Commits with scopes `frontend`, `backend`, `mobile`, `infra`, `docs`.
- **Branches:** `main` is deployable. Work happens on `feature/*` or `fix/*` through pull requests.
- **Quality gate:** lint, typecheck and build (plus tests, once they exist) must pass before merge.
- **Design:** the Lovable prototype is the visual reference. Agree new designs before building them.

---

## 14. How to maintain this file

Keep it **true, short and current**. When something changes, edit the matching section and bump
**Last updated** at the top.

| When… | Update |
| --- | --- |
| A task is finished | Tick it in §8, adjust §9 (progress bars, "Recently completed", "Next up") |
| A phase starts or ends | §7 status, header "Current phase" and "Next milestone" |
| A decision is made | Add a row to §11 (and to the README decision log) |
| A question is answered | Close it in §12 and record the outcome in §11 |
| A new risk or issue appears | Add it to §10 |
| Scope changes | Update §4 and record the decision in §11 |
| Business facts change (services, fleet, cities, contact) | §1, plus the code locations in §13 |

Progress bars use 18 blocks: each `█` is about 5.5 %.
