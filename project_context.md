# Project Context: Driveo Exclusive Platform

> **Read this first.** This is the single file for tracking the project: what we are building and why,
> the plan, every feature and task with its ID, priority and status, progress, risks, decisions and
> open questions. It is written for anyone joining the project: developers, designers, the client, or
> a coding agent picking up the work.
>
> - **Last updated:** 2026-10-29
> - **Current phase:** Phase 2, Backend API and admin, overlapping Phases 1, 3 and 4 (see [§6](#6-plan-phases-and-milestones))
> - **Next milestone:** M2, ready to deploy (see [§6](#6-plan-phases-and-milestones))
> - **Tracker totals:** 111 items · ✅ 57 done · 🟡 2 in progress · ⛔ 14 blocked · ⬜ 30 to do · 💤 6 later · ➖ 2 dropped · v1 progress ≈ 55 % · 10 launch blockers open
>
> The [README](README.md) is the technical entry point (setup, commands, API contract, changelog).
> This file is the project view. Update it in the same change as the work ([§14](#14-how-to-maintain-this-file)).

---

## Table of contents

1. [How to use this file](#1-how-to-use-this-file)
2. [Project information](#2-project-information)
3. [Problem, aims and success criteria](#3-problem-aims-and-success-criteria)
4. [Scope](#4-scope)
5. [Solution and architecture](#5-solution-and-architecture)
6. [Plan: phases and milestones](#6-plan-phases-and-milestones)
7. [Feature and task tracker](#7-feature-and-task-tracker)
8. [Progress](#8-progress)
9. [Next up](#9-next-up)
10. [Risks and known issues](#10-risks-and-known-issues)
11. [Decisions](#11-decisions)
12. [Open questions](#12-open-questions)
13. [Reference](#13-reference)
14. [How to maintain this file](#14-how-to-maintain-this-file)

---

## 1. How to use this file

- **Everything has an ID.** Features and tasks live in one tracker ([§7](#7-feature-and-task-tracker)), grouped by area.
  Risks are `R-xx`, known issues `KI-xx`, decisions `D-xx`, open questions `Qxx`, milestones `Mx`.
  Refer to work by its ID in commits, PRs and messages, e.g. `feat(backend): custom user model (API-09)`.
- **Starting work:** pick the first item in [§9 Next up](#9-next-up) that isn't blocked and whose dependencies
  are done. Set it to 🟡, and to ✅ when its "done when" is met.
- **IDs are permanent.** Never renumber or reuse an ID. New items get the next free number in their area.
  Dropped items stay in the table with status ➖ and a reason.

**Priority**

| Priority | Meaning |
| --- | --- |
| **P0** | Launch blocker: the site can't go live without it |
| **P1** | Required for v1 |
| **P2** | Should have: v1 if time allows, or soon after launch |
| **P3** | Later phase or nice to have |

**Status**

| Status | Meaning |
| --- | --- |
| ✅ Done | Finished and verified |
| 🟡 In progress | Started or partly done; the notes say what remains |
| ⛔ Blocked | Waiting on an open question or decision (named in "Depends on") |
| ⬜ To do | Not started, nothing blocking it |
| 💤 Later | Outside v1 scope until the client decides otherwise (Q12) |
| ➖ Dropped | No longer planned; the notes say why |

**Areas (ID prefixes):** `PRD` product features (what customers get) · `WEB` website · `ADM` content admin ·
`API` backend · `NTF` notifications · `OPS` infrastructure and DevOps · `MOB` mobile apps · `DOC` documentation and project management.

---

## 2. Project information

**Driveo Exclusive Limited** is a premium private chauffeur service, founded in London.

| | |
| --- | --- |
| **Promise** | "Arrive in absolute silence." Discretion, precision and calm |
| **Brand values** | Discretion · Precision · Silence |
| **Operating cities** | London · Paris · Bulgaria · Dubai |
| **Pricing model** | Every journey has one fixed, all-inclusive price from the admin's price grid (service × city × vehicle; hourly hire per hour), shown before booking. Paid later, to the chauffeur or by invoice; nothing online (D-22) |
| **Differentiators** | Vetted, licensed, suited chauffeurs · live flight tracking · immaculate black Mercedes-Benz cars · total privacy |
| **Contact** | +44 330 043 0976 · info@driveoexclusive.com · WhatsApp on the same number |
| **Social** | LinkedIn, TikTok, Snapchat, Facebook, Instagram (links in `frontend/src/config/site.ts`) |
| **Languages** | English, French, Bulgarian, Arabic (right-to-left) |
| **Customers** | High-net-worth private clients, executives, corporate travel managers, event organisers and international travellers |

### Services (live on the website)

| Service | What the customer gets |
| --- | --- |
| **Airport transfer** | Flight tracked from wheels-up, meet and greet inside the terminal, 60 minutes of free waiting |
| **Point-to-point** | One fixed price agreed before travel: office to home, restaurant to hotel, city to coast |
| **Hourly hire** | Chauffeur stays with the client for 2–16 hours. Each hour includes 15 miles within Greater London |
| **Private events** | Weddings, premieres and long-distance road journeys, planned personally, at a fixed price |

### Fleet (live on the website)

| Class | Vehicle | Max passengers | Max luggage |
| --- | --- | --- | --- |
| Business Class | Mercedes-Benz E-Class (2026), black | 4 | 3 |
| First Class | Mercedes-Benz S-Class (2026), long wheelbase, black | 4 | 3 |
| Business Van | Mercedes-Benz VLE, black | 7 | 8 |

### People and accounts

| What | Who / where |
| --- | --- |
| Client | Driveo Exclusive Limited |
| Code | GitHub [`NHasan143/driveo-creative`](https://github.com/NHasan143/driveo-creative); `main` holds the platform |
| Contributors | Naymul Hasan (NHasan143), RafiAwes |
| Database and files | Neon project `driveexclusive` (`icy-block-59285110`), org `org-super-hill-79285047` |

### Project history

| When | Event |
| --- | --- |
| Before 2026-09 | First website generated with Base44 (`driveo-elite-flow.base44.app`), the source of company info and branding |
| 2026-09-11 → 09-12 | Lovable prototype (`driveo-creative-lab.lovable.app`). Code in `driveo-creative/` (reference only) |
| — | Technical proposal agreed: *Technology Stack & Deployment Architecture* v1.0 |
| 2026-10-22 | `frontend/` created: Next.js rebuild of the Lovable design. README and this file added |
| 2026-10-23 | Repository on GitHub; inner pages and language dropdown |
| 2026-10-24 | `backend/` started on Neon (Lakebase Postgres + Object Storage); service detail pages |
| 2026-10-25 | Quote request API with email/WhatsApp alerts; content admin in demo mode |
| 2026-10-26 | Quote form connected to the API; content API with staff sign-in; admin moved to `/admin` |
| 2026-10-27 | Website reads services from the API; site settings screen removed; guide prices started |
| 2026-10-28 | Client's target feature list added to the tracker (PRD-11 to PRD-24) |

---

## 3. Problem, aims and success criteria

**Before this project:** the business ran on AI-generated prototype websites (Base44, then Lovable). Quote
requests went through a backend tied to the prototype. There was no operations dashboard, no app and no
shared business logic.

**The aim** is a professional platform the business owns and can grow:

1. **Win clients:** a fast, search-friendly website that matches the premium brand and turns visitors into bookings.
2. **Never lose a request:** every request is saved first, then the owner is alerted by email and WhatsApp, with retries.
3. **Run operations in one place:** dashboards for content, vehicles, pricing and incoming requests.
4. **Reach clients on their phones:** Android and iOS apps on the same backend.
5. **Stay maintainable:** one shared API, clean architecture and automated deployment.

| # | Objective | Success criteria |
| --- | --- | --- |
| O1 | Premium, on-brand web presence | Matches the approved Lovable design. Lighthouse Performance ≥ 90 and SEO/Accessibility/Best Practices ≥ 95 on mobile. Works from 320 px to 4K |
| O2 | Multilingual reach | EN, FR, BG and AR fully translated, each indexable with hreflang. Arabic renders right-to-left |
| O3 | Reliable lead capture | 100 % of valid bookings stored. Owner alerted by email and WhatsApp within 1 minute. Failures logged and retried |
| O4 | Central operations | Staff manage content, vehicles, pricing and requests in dashboards, with permissions |
| O5 | Mobile apps | Android and iOS apps in the stores, reusing the API and branding |
| O6 | Operational safety | Daily backups, health monitoring, logs, HTTPS everywhere, tested restores |
| O7 | Maintainability | CI runs lint, typecheck, tests and build on every PR. Repeatable deployments. Current documentation |
| O8 | Privacy and compliance | UK GDPR/GDPR: privacy policy, consent for non-essential cookies, data minimisation |

---

## 4. Scope

### In scope (v1)

- Public website: marketing pages, booking form with fixed prices and guest manage links, four languages, SEO, PWA install.
- Shared Django REST API under `/api/v1`.
- Content admin at `/admin` (services, fleet, cities, guide prices, customers, staff) and Django's admin for bookings (confirm, chauffeur, cancel).
- Customer accounts on the website: register, sign in, password reset, details, and their bookings (D-19, D-22).
- Owner notifications: email and Twilio WhatsApp, with logging and retries.
- Android and iOS apps (React + Capacitor) for browsing services and booking.
- Hosting: Docker Compose on a Linux VPS behind Nginx and Cloudflare; CI/CD on GitHub Actions; database and files on Neon.
- Operations: backups, logging and monitoring.

### Out of scope (v1), unless the client agrees otherwise (Q12)

| Out of scope | Tracker items it would add |
| --- | --- |
| Online card payments and automated invoicing | PRD-23 |
| Live driver tracking or a driver app | PRD-24, PRD-22 |
| Distance-based instant pricing (v1 uses the admin's fixed price grid) | PRD-19 |
| Online booking management (modify, cancel) and corporate accounts | PRD-20, PRD-21 |
| High-availability or multi-server infrastructure | — |
| Third-party fees (hosting, Neon, email, Twilio, app stores): paid by the client | — |

### Client's target feature list (added 2026-10-28)

The client shared a reference list for a full chauffeur platform. Each item is tracked in [§7](#7-feature-and-task-tracker):

| Client's list item | Tracker IDs | Status today |
| --- | --- | --- |
| Airport transfers (flight tracking, 1 h free waiting, name sign) | PRD-02, PRD-11 | ✅ Built; name sign and flight-number field to do |
| Hourly / as-directed hire, 2–24 hours | PRD-04, PRD-12 | 🟡 Built for 2–16 hours |
| City-to-city rides | PRD-13 | 🟡 Loosely covered by Point-to-point and Private events |
| Chauffeur hailing (on demand) | PRD-22 | ⬜ Not started (💤 later phase) |
| Enterprise and corporate accounts | PRD-21 | ⬜ Not started (💤 later phase) |
| Business Class (E-Class, 5 Series, A6; up to 3) | PRD-06, PRD-14 | ✅ Built (E-Class, 4 passengers) |
| First Class (S-Class, 7 Series, A8) | PRD-07, PRD-14 | ✅ Built (S-Class) |
| Business Van / SUV (V-Class, Escalade, Suburban; up to 5) | PRD-08, PRD-14 | 🟡 Mercedes VLE only, 7 passengers |
| All-inclusive upfront pricing | PRD-10, PRD-15, PRD-19 | 🟡 Booking at fixed grid prices works; real amounts still to be entered (Q5) |
| Modify or cancel bookings on web and apps | PRD-20, PRD-25 | 🟡 Customer accounts and request history built; modify/cancel later |
| Carbon offset programme | PRD-16 | ⬜ Not started |
| Professional standards (licensed, vetted, English-speaking; amenities) | PRD-17, PRD-18 | ✅ As website copy; preferences to do |

**Summary: 4 of 12 built, 5 partly built, 3 not started.**

---

## 5. Solution and architecture

```
Website (Next.js, incl. /admin) ─┐                           ┌──► Lakebase Postgres (Neon)
Android/iOS apps (planned) ──────┼──► Shared Django REST API ─┼──► Object Storage (Neon, bucket "assets")
Django admin (bookings) ─────────┘          /api/v1           └──► Celery + Redis ──► Email · Twilio WhatsApp
```

- **Hosting (`infra/docker-compose.yml`, not deployed yet):** two host names, the website (`SITE_HOST`) and the API
  with Django's admin (`API_HOST`, e.g. `api.driveoexclusive.com`) (D-21). Cloudflare (DNS, CDN, TLS) → Nginx → containers (Next.js, Django, Celery worker and beat, Redis) on one VPS.
  The database and files live on Neon, not on the VPS.
- **Website ↔ API:** the booking form posts to `/api/v1/bookings/` and the `/booking` page reads, changes or cancels one; the website reads published services from
  `/api/v1/content/published/` (cached about a minute, built-in copy as fallback).
- **Customer accounts ↔ API:** the website's `/account` pages and the booking form use the same session cookie
  and CSRF token as the admin (`/api/v1/account/`). A signed-in customer's booking is linked to them; guests use the token link from their email.
- **Content admin ↔ API:** with `NEXT_PUBLIC_ADMIN_CONTENT_SOURCE=api`, staff sign in (Django session cookie + CSRF token)
  and edit content in Postgres. Otherwise it is a browser-only demo.
- **Full stack table, diagrams, API contract and setup:** [README.md](README.md).

### Repository layout

| Path | What | State |
| --- | --- | --- |
| `frontend/` | Next.js website, plus the content admin at `/admin` | Built, in progress |
| `backend/` | Django + DRF API: `core` (health, staff sign-in), `account`, `bookings`, `content` | Built, in progress |
| `.github/workflows/` | Frontend CI and deploy workflows | Written; deploy paused |
| `mobile/`, `infra/` | Capacitor apps, Compose/Nginx | Planned |
| `driveo-creative/` | Lovable prototype | Reference only, git-ignored |

### Environments

| Environment | Website | API | Database (Neon branch) | State |
| --- | --- | --- | --- | --- |
| Local | http://localhost:3000 (`/admin` for the admin) | http://localhost:8000/api/v1 | `dev` (in `backend/.env.local`; expires 2026-11-05) | Working; no content loaded since the 2026-10-29 reset (ADM-09) |
| Staging | — | — | its own branch (OPS-08) | Not set up |
| Production | — | — | `production` (default branch; no content tables yet, API-10) | Not deployed |

---

## 6. Plan: phases and milestones

Dates aren't set yet (Q9). Each tracker row names its phase.

| Phase | Goal | Status |
| --- | --- | --- |
| **0. Discovery and design** | Brand, design and stack agreed (Lovable prototype, technical proposal) | ✅ Done |
| **1. Website frontend** | Production-quality website | 🟡 Pages done; legal, consent, performance, tests and accessibility remain |
| **2. Backend API and admin** | Shared business logic, content admin and booking admin | 🟡 Booking, account and content APIs, staff sign-in; foundation fixes remain |
| **3. Notifications** | Owner alerts that never lose a request | 🟡 Built and tested; real accounts and recipients missing (Q1, Q2) |
| **4. Integration** | Website and admin on the real API | 🟡 Booking form, accounts and services connected; fleet, cities and tests remain |
| **5. Infrastructure and CI/CD** | Repeatable, secure deployments | ⬜ Workflows written; server, Compose and activation remain |
| **6. Mobile apps** | Android and iOS apps | ⬜ Not started |
| **7. Launch and handover** | Go live and hand over | ⬜ Not started |
| **8. Platform v2** | Client's larger target features: instant pricing, bookings and accounts, corporate, on-demand | 💤 Needs a decision (Q12) |

**Critical path:** Phase 2 foundation (API-09, API-10) → Phase 3 accounts (NTF-03, NTF-05) → Phase 5 (OPS-04, OPS-05, OPS-02) → launch (M3).
Mobile apps can follow launch because they reuse the same API.

### Milestones

| ID | Milestone | Done when | Status |
| --- | --- | --- | --- |
| M1 | Feature-complete locally | Website, quote flow, alerts and content admin work end to end on a developer machine | ✅ Reached 2026-10-26 |
| M2 | Ready to deploy | API-09, API-10, API-12, API-14, OPS-04 and ADM-09 done; CI green (OPS-02) | ⬜ |
| M3 | Live | Every P0 in the tracker is ✅; a real booking reaches the owner by email and WhatsApp in production (NTF-07) | ⬜ |
| M4 | Handover | Runbook and client training done (DOC-05, DOC-06); monitoring and backups verified (OPS-06, OPS-07) | ⬜ |
| M5 | Apps in stores | MOB-01 to MOB-03 done | ⬜ |

---

## 7. Feature and task tracker

The master list. Columns: **ID** · **Feature / task** · **Pri**ority · **Status** · **Ph**ase · **Depends on** · **Notes** (what exists, what remains, where).

### 7.1 Product features (`PRD`): what customers get

| ID | Feature / task | Pri | Status | Ph | Depends on | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| PRD-01 | Operating cities: London, Paris, Bulgaria, Dubai | P1 | ✅ Done | 1 | — | On the website and booking form; editable in the admin. City pages still use built-in copy (WEB-12) |
| PRD-02 | Airport transfers | P1 | ✅ Done | 1 | — | Page and booking option. Flight tracking, meet and greet and 60 min free waiting are delivered by staff by hand |
| PRD-03 | Point-to-point journeys | P1 | ✅ Done | 1 | — | Page and booking option |
| PRD-04 | Hourly hire, 2–16 hours, 15 miles per hour in Greater London | P1 | ✅ Done | 1 | — | Rules in `frontend/src/domain/booking.ts` and `backend/bookings/choices.py`. Extension: PRD-12 |
| PRD-05 | Private events | P1 | ✅ Done | 1 | — | Page and booking option |
| PRD-06 | Business Class (Mercedes E-Class; 4 passengers, 3 bags) | P1 | ✅ Done | 1 | — | Alignment with the client's list: PRD-14 |
| PRD-07 | First Class (Mercedes S-Class; 4 passengers, 3 bags) | P1 | ✅ Done | 1 | — | |
| PRD-08 | Business Van (Mercedes VLE; 7 passengers, 8 bags) | P1 | ✅ Done | 1 | — | SUVs: PRD-14 |
| PRD-09 | Booking at a fixed price with a `DRV-XXXXXX` reference (replaced the quote request on 2026-10-29) | P0 | ✅ Done | 2 | — | Website form + `/api/v1/bookings/` + Django admin; price from the grid (PRD-10), pay later, guests or signed-in (D-22). Alerts: NTF-01 to NTF-08 |
| PRD-10 | Price grid per service, city and vehicle class (what bookings cost; lowest shown as "From €X") | P1 | 🟡 In progress | 2 | Q5 | Admin Prices grid, `ServicePrice`, website "From" price, exact price in the booking form, API prices bookings from it. Remaining: the client enters real amounts. `dev` has **placeholder** prices for testing only |
| PRD-11 | Airport extras: name-sign wording and a flight-number field | P2 | 🟡 In progress | 4 | — | Flight-number field done (form, API, emails, admin). Remaining: name-sign wording in 4 languages. Flight-status integration later |
| PRD-12 | Hourly hire up to 24 hours | P2 | ⛔ Blocked | 4 | Q13 | Done when: the agreed maximum is applied in copy, booking form and API validation, with tests |
| PRD-13 | City-to-city rides as its own service | P2 | ⬜ To do | 4 | ADM-08 | Done when: published from the admin with its own page and bookable in the booking form |
| PRD-14 | Fleet aligned with the client's list (capacities, "or similar" models, SUVs) | P2 | ⛔ Blocked | 4 | Q13 | Ideally read capacities from the content API so admin edits drive the form and validation |
| PRD-15 | "All-inclusive" price statement (tolls, taxes, fees, gratuity) | P2 | ⛔ Blocked | 4 | Q14 | Copy in 4 languages, only once the business confirms it |
| PRD-16 | Carbon offset programme | P3 | ⛔ Blocked | 8 | Q14 | Needs an offset partner first; then copy and, if wanted, a per-ride estimate |
| PRD-17 | Chauffeur standards copy (vetted, licensed, suited; car amenities) | P1 | ✅ Done | 1 | — | Operational promises, described on the website |
| PRD-18 | "English-speaking" chauffeurs and passenger preferences (temperature, music, quiet ride) | P2 | ⬜ To do | 4 | — | Done when: copy updated where true; preferences are optional booking fields shown in alerts |
| PRD-19 | Instant pricing: distance/time-based fixed price shown before booking | P3 | 💤 Later | 8 | Q5, Q12 | Needs pricing rules, a route/distance service and API-17 |
| PRD-20 | Booking management: bookings with a status, modify or cancel on web | P1 | ✅ Done | 2 | PRD-25 | Statuses pending/confirmed/completed/cancelled; customers change or cancel until 24 h before pickup from the email link (`/booking`) or My account; staff confirm, assign the chauffeur and cancel in Django's admin. Apps: MOB-02 |
| PRD-21 | Corporate accounts: company bookers, booking for guests, consolidated invoices, account manager | P3 | 💤 Later | 8 | PRD-20, PRD-23 | |
| PRD-22 | On-demand chauffeur hailing (immediate pickups) | P3 | 💤 Later | 8 | Q12, PRD-24 | Needs live availability and dispatch |
| PRD-23 | Online card payments and automated invoicing | P3 | 💤 Later | 8 | Q12 | Out of v1 scope |
| PRD-24 | Driver app and live driver tracking | P3 | 💤 Later | 8 | Q12 | Out of v1 scope |
| PRD-25 | Customer accounts: register, sign in, forgotten password, details, booking history | P1 | ✅ Done | 2 | API-09 | Website `/account` pages (WEB-22) on `/api/v1/account/` (API-20). Signed-in bookings are linked to the customer and the form fills in their details |

### 7.2 Website (`WEB`): `frontend/`

| ID | Feature / task | Pri | Status | Ph | Depends on | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| WEB-01 | Lovable design ported (hero, services, fleet, cities, process, booking form, testimonial, footer) | P1 | ✅ Done | 1 | — | Section heights match the original at 1440 px |
| WEB-02 | Four languages at `/?lang=xx`, right-to-left Arabic, language dropdown | P0 | ✅ Done | 1 | — | Old `/en` links redirect; missing keys fail the build |
| WEB-03 | SEO: metadata, canonical, hreflang, sitemap, robots, JSON-LD, manifest | P1 | ✅ Done | 1 | — | |
| WEB-04 | Inner pages: Services, Fleet, Cities, Process | P1 | ✅ Done | 1 | — | Each ends in the booking form with matching pre-fill |
| WEB-05 | Service detail pages (4 services × 4 languages) and header Services dropdown | P1 | ✅ Done | 1 | — | |
| WEB-06 | Motion (GSAP reveals, parallax), off under reduced motion | P2 | ✅ Done | 1 | — | |
| WEB-07 | PWA "Add to Home Screen" | P3 | ✅ Done | 1 | — | |
| WEB-08 | Booking form: validation, capacity limits, hourly flow, flight number, exact price, honeypot, cooldown | P0 | ✅ Done | 1 | — | Was the quote form until 2026-10-29 |
| WEB-09 | Booking form connected to the API, with field and rate-limit errors in 4 languages; `/booking` page to view, change or cancel | P0 | ✅ Done | 4 | API-03 | Verified locally 2026-10-29: guest booking, token link, change (repriced), signed-in My account, cancel in Arabic |
| WEB-10 | Production Dockerfile (standalone, non-root, healthcheck) | P1 | ✅ Done | 1 | — | Not built locally yet (Docker wasn't running); CI builds it |
| WEB-11 | Services read from the content API | P1 | ✅ Done | 4 | API-05 | Menu, home, Services page, detail pages and sitemap; cached ~1 min; built-in copy as fallback |
| WEB-12 | Fleet and cities read from the content API | P1 | ⬜ To do | 4 | API-05 | Admin edits to fleet and cities don't reach the website yet |
| WEB-13 | Legal pages: privacy, terms, cookies (4 languages, linked in the footer) | P0 | ⛔ Blocked | 1 | Q7 | |
| WEB-14 | Consent banner; analytics only after consent | P1 | ⬜ To do | 1 | WEB-13 | |
| WEB-15 | Performance pass: compress hero videos (≈3.4 MB and ≈9.9 MB), poster-first on mobile | P1 | ⬜ To do | 1 | — | Done when Lighthouse meets O1 |
| WEB-16 | Automated tests: unit (schema, mapping, locale proxy) and Playwright end to end | P1 | ⬜ To do | 4 | — | |
| WEB-17 | Accessibility audit (WCAG 2.1 AA) with fixes | P1 | ⬜ To do | 1 | — | |
| WEB-18 | Replace the sample testimonial with a real, approved quote | P1 | ⛔ Blocked | 1 | Q8 | |
| WEB-19 | Native-speaker review of FR, BG and AR copy | P1 | ⬜ To do | 1 | — | |
| WEB-20 | Hourly-hire mileage note for cities outside London | P2 | ⛔ Blocked | 1 | Q6 | |
| WEB-21 | Dynamic copyright year | P3 | ⬜ To do | 1 | — | `© 2026` is fixed in the dictionaries |
| WEB-22 | Account pages in 4 languages: sign in, create account, forgot/reset password, My account; Account link in header (640px+) and footer; booking form pre-fill | P1 | ✅ Done | 4 | API-20 | `src/features/account/`. Copy needs the native-speaker review (WEB-19) |

### 7.3 Content admin (`ADM`): `frontend/src/admin/`, at `/admin`

| ID | Feature / task | Pri | Status | Ph | Depends on | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| ADM-01 | Admin inside the website app at `/admin` (own root layout, production gate `ADMIN_ENABLED`) | P1 | ✅ Done | 2 | — | Turn the gate on in production only with API mode |
| ADM-02 | Create, edit, duplicate, publish, reorder and delete services, vehicles and cities | P1 | ✅ Done | 2 | — | With reference cleanup |
| ADM-03 | Four-language editing with completeness tracking, right-to-left Arabic | P1 | ✅ Done | 2 | — | |
| ADM-04 | Photo upload (resized; stored in the Neon `assets` bucket in API mode) and photo library | P1 | ✅ Done | 2 | API-05 | |
| ADM-05 | Dashboard (counts, translation progress, needs attention, recent edits) | P2 | ✅ Done | 2 | — | Redesigned 2026-10-27 |
| ADM-06 | API mode with staff sign-in (`NEXT_PUBLIC_ADMIN_CONTENT_SOURCE=api`) | P0 | ✅ Done | 2 | API-05, API-06 | Demo mode (browser storage) is the default |
| ADM-07 | Site settings screen (company, contacts, social links, testimonials) | P2 | ➖ Dropped | 2 | — | Removed 2026-10-27: site information stays in `frontend/src/config/site.ts`. The backend model and endpoint remain unused (API-19) |
| ADM-08 | Services added in the admin are bookable in the booking form | P2 | ⛔ Blocked | 4 | decision | Today only the four built-in services are bookable. Needed for PRD-13 |
| ADM-09 | Load the website's original content into the production database | P0 | ⬜ To do | 5 | API-10 | The admin's "Load original content" button went with the settings screen. `POST /api/v1/content/import/` (superusers) still exists; add a management command or button |
| ADM-10 | Warn about unsaved changes when moving between admin pages | P3 | ⬜ To do | 2 | — | Closing or reloading the tab already warns |
| ADM-11 | Narrower editor permissions (Django groups) | P3 | ⬜ To do | 2 | — | Today any staff account edits all content |
| ADM-12 | Customers screen: search, details, their bookings, deactivate or reactivate | P1 | ✅ Done | 2 | API-20 | `/admin/customers`; links each booking to Django's admin |
| ADM-13 | Staff screen (superusers): add staff, make superuser, deactivate, set a password | P1 | ✅ Done | 2 | API-20 | `/admin/staff`; hidden from other staff |
| ADM-14 | My account for staff: details and password | P2 | ✅ Done | 2 | API-20 | `/admin/account` |

### 7.4 Backend API (`API`): `backend/`

| ID | Feature / task | Pri | Status | Ph | Depends on | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| API-01 | Django 6.1 + DRF project, settings from environment, `GET /api/v1/health/` | P0 | ✅ Done | 2 | — | Secrets only in `backend/.env.local` |
| API-02 | Neon Lakebase Postgres (pooled + direct) and private `assets` bucket as default storage | P0 | ✅ Done | 2 | — | Checked end to end |
| API-03 | Bookings API: `POST /api/v1/bookings/` (validation, pricing, honeypot, 10/hour rate limit), `GET`/`PATCH` and cancel by owner or token, `GET /api/v1/account/bookings/` | P0 | ✅ Done | 2 | — | Contract in README#api-contract and `frontend/README.md#backend-contract`. Replaced quote requests 2026-10-29 |
| API-04 | Django admin for bookings: confirm, complete, cancel, chauffeur and car, staff notes, message log, resend | P1 | ✅ Done | 2 | — | Status changes email the customer |
| API-05 | Content API `/api/v1/content/` (services, vehicles, cities, reorder, snapshot, import, images, published) | P1 | ✅ Done | 2 | — | Translations as JSON per field; camelCase JSON |
| API-06 | Staff sign-in API `/api/v1/auth/` (session cookie + CSRF, rate limited) | P0 | ✅ Done | 2 | — | Website and API must share a site (KI-08) |
| API-07 | Security defaults: DRF deny-by-default, CORS allow-list, Secure cookies when `DEBUG` is off | P0 | ✅ Done | 2 | — | |
| API-08 | Backend test suite (Django `TestCase`, run on a Neon test database) | P1 | ✅ Done | 2 | — | Tests across `account`, `bookings`, `content` and `core`, all passing on 2026-10-29 in the conda env `driveexclusive`. Long runs on Neon can lose the database connection midway (KI-16); rerun the failed tests |
| API-09 | Custom user model (`AUTH_USER_MODEL`) | P0 | ✅ Done | 2 | — | `account.User` (app `backend/account/`) on Django's `auth_user` table, 32-bit id, email unique ignoring case. Existing databases switch with `manage.py adopt_custom_user` once, then `migrate`. Done on `dev` 2026-10-29; `production` is part of API-10 |
| API-10 | Apply all migrations on the `production` branch (`migrate --database direct`) | P0 | ⬜ To do | 5 | API-09 | Steps: `adopt_custom_user`, then `migrate --database direct` (account 0002, content 0001–0003). Rehearsed on `dev` (a copy of `production`) on 2026-10-29 |
| API-11 | Settings split (development / production) | P1 | ➖ Dropped | 2 | — | Dropped 2026-10-29 (D-20): one settings file, production set by environment variables |
| API-12 | Backend Dockerfile (web, Celery worker and beat) | P0 | ✅ Done | 5 | — | Done 2026-10-29: `backend/Dockerfile`, `gunicorn.conf.py`, `.dockerignore`. Built (469 MB) and run against `dev`: healthy, non-root, no secret files, Celery app loads; with production variables it redirects to HTTPS, sends HSTS and Secure cookies, and serves admin static files |
| API-13 | ruff linting and pytest | P2 | ⬜ To do | 2 | — | |
| API-14 | Production HTTPS settings: HSTS, `SECURE_PROXY_SSL_HEADER`, real client IP and shared Redis cache for rate limits | P0 | ✅ Done | 5 | — | Done 2026-10-29, all opt-in through environment variables (README "Backend production settings"), plus WhiteNoise for admin static files and console logging. The production values are set when OPS-04/OPS-05 deploy |
| API-15 | Dependency audit (pip and npm) | P1 | ⬜ To do | 5 | — | |
| API-16 | OpenAPI schema (drf-spectacular) linked from the README | P2 | ⬜ To do | 2 | — | |
| API-17 | Data model for Customer, Booking, PricingRule, Availability | P3 | 💤 Later | 8 | Q3, Q5, Q12 | Basis for PRD-19 to PRD-21 |
| API-18 | Delete content photos from the bucket when no record uses them | P3 | ⬜ To do | 2 | — | |
| API-19 | Remove (or reuse) the unused `SiteSettings` model and endpoint | P3 | ⬜ To do | 2 | — | Left over from ADM-07 |
| API-20 | Accounts API: `/api/v1/account/` (customers) and `/api/v1/staff/` (customers list, staff accounts) | P1 | ✅ Done | 2 | API-09 | Session cookie + CSRF, rate-limited sign-in, registration and reset; Django password validators |
| API-21 | Send password-reset emails through Celery instead of inside the request | P3 | ⬜ To do | 5 | NTF-03 | A slow SMTP server only delays that one response today; failures are logged |

### 7.5 Notifications (`NTF`)

| ID | Feature / task | Pri | Status | Ph | Depends on | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| NTF-01 | Async pipeline: a saved booking queues Celery tasks (Redis broker) | P0 | ✅ Done | 3 | — | The customer never waits on providers |
| NTF-02 | Owner email alert (HTML + text, customer as Reply-To, reply buttons) over any SMTP provider | P0 | ✅ Done | 3 | — | |
| NTF-03 | Email provider chosen and sender domain verified | P0 | ⛔ Blocked | 3 | Q2 | |
| NTF-04 | Owner WhatsApp alert via Twilio (sandbox text and approved-template support) | P0 | ✅ Done | 3 | — | |
| NTF-05 | Twilio account, WhatsApp sender, approved template, owner's number | P0 | ⛔ Blocked | 3 | Q1 | Production needs a Meta-approved template (KI-04) |
| NTF-06 | Reliability: retries (1/2/4/8/16 min), delivery log, 10-minute sweep, resend in admin | P0 | ✅ Done | 3 | — | |
| NTF-08 | Customer emails in 4 languages: booking received, changed, confirmed (with chauffeur), cancelled, each with the manage link | P1 | ✅ Done | 3 | — | The owner is also alerted of changes and cancellations |
| NTF-07 | Real alert test in production: a booking reaches the owner by email and WhatsApp | P0 | ⬜ To do | 7 | NTF-03, NTF-05, OPS-04 | Launch gate (M3) |

### 7.6 Infrastructure and DevOps (`OPS`)

| ID | Feature / task | Pri | Status | Ph | Depends on | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| OPS-01 | Frontend CI/CD workflows (lint, typecheck, build, Docker check; GHCR image; SSH deploy) | P1 | ✅ Done | 5 | — | Deploy job is paused in `frontend-deploy.yml` |
| OPS-02 | Activate CI/CD: production environment and secrets, branch protection, resume deploy | P0 | ⬜ To do | 5 | OPS-05 | |
| OPS-03 | Backend CI workflow (tests) | P1 | ⬜ To do | 5 | — | Tests need a Neon test database or a Postgres service |
| OPS-04 | Docker Compose stack: frontend, backend, worker, beat, Redis, Nginx, health checks | P0 | ✅ Done | 5 | API-12 | Done 2026-10-29: `infra/` (compose, Nginx template, env templates, build override). Run locally end to end. On the server it needs OPS-05 (host, domain, certificate) |
| OPS-05 | VPS, production domain, Cloudflare DNS/TLS and security headers | P0 | ⛔ Blocked | 5 | Q4 | |
| OPS-06 | Backups: Neon history retention, snapshots, a tested restore | P0 | ⬜ To do | 5 | Q11 | |
| OPS-07 | Monitoring: uptime checks, error tracking, central logs, alerts | P1 | ⬜ To do | 5 | OPS-05 | |
| OPS-08 | Staging environment on its own Neon branch | P2 | ⬜ To do | 5 | OPS-04 | |
| OPS-09 | Neon `dev` branch for local work | P1 | ✅ Done | 2 | — | Created 2026-10-26; reset from `production` 2026-10-29; expires 2026-11-05. Recreate with `neon checkout dev --create`, then `adopt_custom_user` and `migrate` |
| OPS-10 | Neon account ownership and paid plan for production | P1 | ⛔ Blocked | 5 | Q11 | |
| OPS-11 | Publish the backend image to GHCR and deploy it (workflow like `frontend-deploy.yml`) | P0 | ⬜ To do | 5 | OPS-03 | `infra/docker-compose.yml` pulls `ghcr.io/nhasan143/driveo-backend:production`, which nothing publishes yet. Stopgap: build on the server with `docker-compose.build.yml` |

### 7.7 Mobile apps (`MOB`): `mobile/`

| ID | Feature / task | Pri | Status | Ph | Depends on | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| MOB-01 | App shell: React + Vite + TypeScript + Capacitor, branding, 4 languages, RTL | P2 | ⬜ To do | 6 | — | |
| MOB-02 | Core flows: browse services and fleet, book through the API, see and manage the booking | P2 | ⬜ To do | 6 | MOB-01 | Booking API ready (PRD-20) |
| MOB-03 | Store release: signed Android and iOS builds, listings, privacy labels | P2 | ⛔ Blocked | 6 | Q10 | |

### 7.8 Documentation and project management (`DOC`)

| ID | Feature / task | Pri | Status | Ph | Depends on | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| DOC-01 | README: overview, setup, API contract, decision log, changelog | P1 | ✅ Done | — | — | Keep current with every change |
| DOC-02 | This project context file with the tracker | P1 | ✅ Done | — | — | |
| DOC-03 | Ignore rules (root and frontend `.gitignore`) | P1 | ✅ Done | — | — | |
| DOC-04 | GitHub repository and pull-request workflow | P1 | ✅ Done | — | — | Branch protection is part of OPS-02 |
| DOC-05 | Runbook: deploy, rollback, backup restore, "alert failed" | P1 | ⬜ To do | 7 | OPS-04 | |
| DOC-06 | Client handover and training (Django admin, content admin) | P1 | ⬜ To do | 7 | — | |
| DOC-07 | Phase dates and budget | P1 | ⛔ Blocked | — | Q9 | |

---

## 8. Progress

_Snapshot as of 2026-10-29. Percent = (done + half of in progress) ÷ items in v1 scope (excludes 💤 Later and ➖ Dropped).
It counts items, not effort: the remaining items include the larger ones (deployment, tests, mobile apps)._

| Area | Progress | ✅ Done | 🟡 In progress | ⛔ Blocked | ⬜ To do | 💤 Later | ➖ Dropped | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Product features (`PRD`) | ███████████░░░░░░░ 61 % | 11 | 1 | 4 | 3 | 6 | 0 | 25 |
| Website (`WEB`) | ██████████░░░░░░░░ 55 % | 12 | 0 | 3 | 7 | 0 | 0 | 22 |
| Content admin (`ADM`) | ████████████░░░░░░ 69 % | 9 | 0 | 1 | 3 | 0 | 1 | 14 |
| Backend API (`API`) | ███████████░░░░░░░ 63 % | 12 | 0 | 0 | 7 | 1 | 1 | 21 |
| Notifications (`NTF`) | ██████████░░░░░░░░ 57 % | 4 | 0 | 2 | 1 | 0 | 0 | 7 |
| Infrastructure (`OPS`) | █████░░░░░░░░░░░░░ 27 % | 3 | 0 | 2 | 6 | 0 | 0 | 11 |
| Mobile apps (`MOB`) | ░░░░░░░░░░░░░░░░░░ 0 % | 0 | 0 | 1 | 2 | 0 | 0 | 3 |
| Docs and PM (`DOC`) | ██████████░░░░░░░░ 57 % | 4 | 0 | 1 | 2 | 0 | 0 | 7 |
| **All** | ██████████░░░░░░░░ **55 %** | **55** | **1** | **14** | **31** | **7** | **2** | **110** |

**Open launch blockers (P0 not done): 10** · WEB-13, ADM-09, API-10, NTF-03, NTF-05, NTF-07, OPS-02, OPS-05, OPS-06, OPS-11

### What works today

- **Website** (`npm run dev`): every page in four languages with right-to-left Arabic, SEO, PWA, service detail pages.
  Services come from the API. Passes `lint`, `typecheck` and `build`.
- **Booking flow:** website form → API (priced) → Postgres → Celery → customer and owner emails, checked locally with real submissions.
  The WhatsApp alert code is built and tested, but no Twilio account is connected yet.
- **Content admin:** at `/admin`, full editing of services, fleet, cities and guide prices in four languages; in API mode
  with staff sign-in and photos in the bucket.
- **Backend:** runs locally on the Neon `dev` branch with all migrations applied there. The health endpoint reports
  database and storage.

### What doesn't work yet

- Nothing is deployed (OPS-04, OPS-05). Alerts have no real recipients, email provider or Twilio account (NTF-03, NTF-05).
- The `production` database has no content tables and no content (API-10, ADM-09).
- Admin edits to fleet and cities don't reach the website (WEB-12).
- Guide prices are not committed and have no amounts (PRD-10).
- No website tests, no backend CI, no monitoring and no tested backups.
- From the client's list: no bookings or accounts, instant pricing, corporate accounts, on-demand hailing or carbon offset (Phase 8).

### Recently completed

- 2026-10-29: **Bookings replace quote requests** (PRD-09, PRD-20, API-03, API-04, WEB-08, WEB-09, NTF-08, D-22): fixed prices from the admin grid, pay later, guest token links and My account, change or cancel until 24 h before pickup, customer emails in 4 languages, Django admin confirm, assign and cancel. Website copy rewritten in 4 languages. Placeholder prices on `dev`. Fixed CORS for the guest token header.
- 2026-10-29: Production stack (OPS-04) in `infra/`, run locally end to end; found and fixed Nginx 502s after container restarts, Django's redirect breaking internal API calls, and Compose mangling `$` in the secret key.
- 2026-10-29: Backend Docker image (API-12): one image for API, worker and scheduler, built and checked against `dev`, including production settings.
- 2026-10-29: Production settings (API-14): proxy HTTPS header, HTTPS redirect, HSTS, real client IP, shared Redis cache, WhiteNoise, logging. `check --deploy` passes apart from the missing SMTP (NTF-03) and deliberate HSTS switches. API-11 dropped (D-20).
- 2026-10-29: Customer and staff accounts (PRD-25, API-20, WEB-22, ADM-12 to ADM-14): website account pages in 4 languages, quote requests linked to customers, admin Customers, Staff and My account screens. 109 backend tests pass.
- 2026-10-29: Custom user model `account.User` with case-insensitive unique email, and the `adopt_custom_user` switch-over command (API-09). `dev` reset to a copy of `production` and switched over as a rehearsal for API-10.
- 2026-10-29: This file restructured into one tracker (IDs, priorities, statuses, milestones).
- 2026-10-28: Client's target feature list added (PRD-11 to PRD-24); backend packages installed in the conda environment `driveexclusive`.
- 2026-10-27: Website reads services from the API (WEB-11); site settings screen dropped (ADM-07); admin dashboard redesigned; guide prices built (PRD-10, uncommitted).
- 2026-10-26: Content API and staff sign-in (API-05, API-06, ADM-06); quote form connected to the API (WEB-09); admin moved into the website at `/admin` (ADM-01); Neon `dev` branch (OPS-09).
- 2026-10-25: Quote request API, Django admin and email/WhatsApp alerts with retries (API-03, API-04, NTF-01 to NTF-06); content admin in demo mode.
- 2026-10-24: Backend on Neon (API-01, API-02); service detail pages and header dropdown (WEB-05).
- 2026-10-23: Inner pages and language dropdown (WEB-04, WEB-02); repository on GitHub (DOC-04).
- 2026-10-22: Next.js website, CI/CD workflows, README and this file (WEB-01, OPS-01, DOC-01).

---

## 9. Next up

In order. If an item is blocked, take the next one.

| # | ID | Task | Why now |
| --- | --- | --- | --- |
| 1 | API-10, ADM-09 | Migrate `production`; add a way to load the original content | The production database is empty (M2) |
| 2 | WEB-12 | Website reads fleet and cities from the API | Admin edits otherwise don't show (Phase 4) |
| 3 | OPS-05 → OPS-02 | Server, domain, certificate; then turn on deploys | The stack is ready to run (M2) |
| 4 | Client | Answer Q1, Q2, Q4, Q7 | They block the P0 items NTF-03, NTF-05, OPS-05 and WEB-13 |
| 5 | OPS-02, OPS-03 | Activate CI/CD; backend CI | Quality gate before launch |
| 6 | WEB-15, WEB-16, WEB-17 | Performance, tests, accessibility | O1 and O7 before launch |
| 7 | Client | Answer Q12–Q14 | Unblocks the quick wins PRD-11 to PRD-15 and PRD-18, and the Phase 8 plan |

---

## 10. Risks and known issues

### Risks

| ID | Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- | --- |
| R-01 | Website launched before alerts work, so leads are lost | High | Low | Deploys refuse mock mode; NTF-07 is a launch gate (M3) |
| R-02 | Single VPS has no high availability | Medium | Low–Medium | Accepted for launch. Containers can move hosts; backups and monitoring required (OPS-06, OPS-07) |
| R-03 | Notification provider outage | Medium | Medium | Save first, notify later; retries and failure log (NTF-06) |
| R-04 | Spam or abuse of the booking form | Medium | Medium | Honeypot, client cooldown, validation, 10/hour per-IP limit. CAPTCHA only if needed |
| R-05 | Personal-data compliance (UK GDPR/GDPR) | High | Medium | Privacy policy and consent (WEB-13, WEB-14), data minimisation, staff-only access |
| R-06 | Third-party costs not budgeted | Medium | Medium | Client costs (§4). Confirm the budget (Q9) |
| R-07 | Scope creep from the target feature list (payments, driver app, instant pricing, corporate) | High | High | Phase 8 items stay 💤 until Q12 is decided and recorded in §11 |
| R-08 | Translations not reviewed by native speakers | Medium | Medium | WEB-19 before launch |
| R-09 | Dependence on Neon (outage, pricing, plan limits) | Medium | Low | Standard Postgres and S3: data can move with `pg_dump` and S3 tools. Q11 |
| R-10 | Leaked credentials | High | Low | Secrets only in `.env.local` or the server environment; rotate Neon credentials if exposed |
| R-11 | The website promises things the business doesn't do (flight tracking, all-inclusive, carbon offset) | Medium | Medium | Change copy only after the client confirms (Q14) |

### Known issues and technical debt

| ID | Issue | Tracker |
| --- | --- | --- |
| KI-01 | No automated dependency updates since Dependabot was removed. Run `npm outdated` monthly; align `@types/node` (`^20`) with Node 24 | API-15 |
| KI-02 | Large hero videos (≈3.4 MB and ≈9.9 MB) are slow on mobile data | WEB-15 |
| KI-03 | Rate limits need `DRF_NUM_PROXIES` and `CACHE_REDIS_URL` set in production; without them every visitor shares Nginx's IP and each web worker counts separately (the settings exist since API-14) | OPS-04 |
| KI-04 | Production WhatsApp alerts need a Meta-approved template; free-form messages only work in the sandbox or within 24 hours | NTF-05 |
| KI-05 | The testimonial is the design's sample quote | WEB-18 |
| KI-06 | Uploaded content photos are never deleted from the bucket | API-18 |
| KI-07 | Any staff account can edit all content; only superusers can import | ADM-11 |
| KI-08 | Staff and customer sign-in need the website and API on one site; the stack's two host names (`driveoexclusive.com` + `api.driveoexclusive.com`) satisfy this. Don't move the API to an unrelated domain | OPS-05 |
| KI-09 | The `dev` Neon branch expires on 2026-11-05 with its data (test superuser `devadmin`; no content since the 2026-10-29 reset) | OPS-09 |
| KI-10 | Python environments: `backend/.venv` (Python 3.12) or the conda env `driveexclusive` (Python 3.15; all tests pass there). Base Anaconda has Django 4.2 and fails with `No module named 'dj_database_url'`. `.claude/launch.json` has `backend-conda` | — |
| KI-11 | The Neon CLI must be signed in to org `org-super-hill-79285047`; the user-level Neon MCP key belongs to another org, so `.mcp.json` pins this project | — |
| KI-12 | Arabic headings fall back to Noto Kufi Arabic (Fraunces has no Arabic glyphs); needs a designer review | WEB-19 |
| KI-13 | The copyright year is fixed in the dictionaries | WEB-21 |
| KI-14 | Unused `SiteSettings` model and `/api/v1/content/settings/` endpoint after the settings screen was dropped | API-19 |
| KI-15 | One session per browser: the website, its admin and Django's admin share the session cookie, so signing in to one as a different person signs the other out | — |
| KI-16 | A full test run takes ~7 minutes against Neon; Neon sometimes closes the connection midway, failing the rest of one test class with `the connection is closed`. Rerunning those tests passes. Backend CI should retry or use a local Postgres | OPS-03 |

---

## 11. Decisions

Newest first. The README has the same log for developers; keep both in sync.

| ID | Date | Decision | Why | Alternatives considered |
| --- | --- | --- | --- | --- |
| D-22 | 2026-10-29 | Bookings replace quote requests: fixed price from the admin's grid, no online payment (paid to the chauffeur or by invoice), guests can book and manage through a private link, changes and cancellation until 24 h before pickup, staff confirm in Django's admin | Client decisions. Customers see and accept a price at once; no payment provider for v1; guests aren't forced to register | Keep quotes; quotes plus bookings; online card payment (PRD-23) |
| D-21 | 2026-10-29 | The website and the API get separate host names (`driveoexclusive.com`, `api.driveoexclusive.com`); Nginx routes by host. Behind it Django's own HTTPS redirect is off | Django's admin (`/admin/`) and the website's content admin (`/admin`) would collide on one domain; a subdomain keeps sign-in cookies same-site. The redirect broke the website's internal calls to the API | One domain with `/api` routing and Django's admin moved to another path |
| D-20 | 2026-10-29 | One settings file for every environment; production switches (HTTPS, proxies, cache) are environment variables, all off by default. API-11 dropped | Twelve-factor style; no settings module to keep in sync; local runs need no extra variables | `config/settings/{base,development,production}.py` |
| D-19 | 2026-10-29 | Customers get accounts in v1 (register, sign in, booking history), on the same Django users and session mechanism as staff. Booking management stays later (PRD-20) | Answers Q3. Returning clients find their requests and skip retyping details; one user table and one sign-in mechanism to secure | Anonymous requests only; a separate customer identity service (e.g. Neon Auth) |
| D-18 | 2026-10-28 | The client's target feature list is tracked as PRD-11 to PRD-24; items outside v1 scope stay 💤 until Q12 | Keeps v1 shippable while recording what the client wants | Adding everything to v1 |
| D-17 | 2026-10-27 | Guide prices in euros per service, city and vehicle class (hourly hire per hour), shown as "from" prices; the final price is still quoted by hand (superseded by D-22: the grid is the price) | Answers Q5 in part: customers see a starting point without automatic pricing | Instant pricing (PRD-19) |
| D-16 | 2026-10-27 | No site settings screen in the admin; site information stays in `frontend/src/config/site.ts` | Rarely changes; simpler admin | A settings screen (built, then dropped: ADM-07) |
| D-15 | 2026-10-26 | Staff sign in to the content admin with Django's session cookie + CSRF token | HttpOnly cookie no script can read; instant sign-out; reuses Django users and `is_staff`. Needs one site for website and API | DRF tokens or JWT in browser storage; Neon Auth |
| D-14 | 2026-10-26 | Translated content stored as JSON per field (`{"en","fr","bg","ar"}`); the content API speaks camelCase | Lists of translated items fit naturally; new languages need no migration; matches the admin's types | A column per language; translation tables |
| D-13 | 2026-10-26 | Content photos stored as references, served through a redirect endpoint | The bucket is private and presigned links expire | Public bucket; saving presigned links |
| D-12 | 2026-10-26 | The content admin lives in the website app at `/admin`, hidden in production unless `ADMIN_ENABLED=true` | One app to run and deploy; admin code never loads on website pages | A separate `admin/` app (built, then retired) |
| D-11 | 2026-10-25 | Content admin built first against browser storage behind a `ContentRepository` interface | Client wanted the admin UI first; swapping storage is one implementation | Django admin for content; API first |
| D-10 | 2026-10-24 | All local backend secrets in `backend/.env.local`; no secrets or fallback key in `settings.py` | One place; `neon env pull` only touches its own lines; fails fast | A separate `backend/.env` |
| D-09 | 2026-10-24 | Database and files on Neon instead of a Postgres container on the VPS (supersedes that part of proposal v1.0) | Managed backups, branches for dev and staging, one fewer stateful service | Postgres container; AWS RDS + S3 |
| D-08 | 2026-10-24 | Dependabot removed; dependencies updated manually | Too many unsuitable automated PRs | Quieter Dependabot settings |
| D-07 | 2026-10-23 | Public language URLs use `/?lang=en` instead of `/en` paths | Client preference; pages stay prerendered and indexable | `/en` paths |
| D-06 | 2026-10-22 | CI/CD on GitHub Actions: GHCR images, SSH + Compose deploy, mock-mode deploys blocked | No paid services; fits the VPS plan | Self-hosted runner; Vercel |
| D-05 | 2026-10-22 | `driveo-creative/` kept as a read-only, git-ignored reference | Separate repository and stack | Git submodule |
| D-04 | 2026-10-22 | Website rebuilt in Next.js, not extended from Lovable | Agreed stack; better SEO and maintainability | TanStack Start + Supabase |
| D-03 | 2026-10-22 | API values are stable snake_case ids; labels live in translations | Labels can change without breaking data | Sending display text |
| D-02 | 2026-10-22 | Frontend mock mode until the API exists; styling with Tailwind, CSS Modules and CSS variables | Parallel work; faithful port of the design | Waiting for the backend; utilities only |
| D-01 | Proposal v1.0 | Django + DRF shared API; Redis and Celery; Docker on a VPS | Proven, secure, one place for business rules | — |

---

## 12. Open questions

| ID | Question | Blocks | Owner | Status |
| --- | --- | --- | --- | --- |
| Q1 | Who receives booking alerts (email addresses, WhatsApp number)? | NTF-05 | Client | Open |
| Q2 | Which email provider and sender domain? | NTF-03 | Client + dev | Open |
| Q3 | Do customers need accounts in v1, or only anonymous requests? | PRD-25, API-17 | Client | Answered 2026-10-29: yes, accounts (D-19); anonymous requests still work |
| Q4 | Production domain, VPS provider and Cloudflare access | OPS-05 | Client | Open |
| Q5 | Pricing: what may the system calculate vs. what is always quoted by hand? | PRD-19 | Client | Answered 2026-10-29 (D-22): the admin's price grid is the price; real amounts still to be entered |
| Q6 | Hourly-hire mileage allowance outside London | WEB-20 | Client | Open |
| Q7 | Legal copy (privacy, terms, cookies): who writes and approves it? | WEB-13 | Client | Open |
| Q8 | Real client testimonial(s) approved for publication | WEB-18 | Client | Open |
| Q9 | Budget and timeline per phase | DOC-07, §6 | Client | Open |
| Q10 | Apple and Google developer accounts owned by the business | MOB-03 | Client | Open |
| Q11 | Neon account ownership and production plan | OPS-06, OPS-10 | Client + dev | Open |
| Q12 | Which items from the target feature list join v1 (instant pricing, corporate, on-demand, payments, driver app)? | PRD-19, PRD-21 to PRD-24, Phase 8 | Client | Partly answered: bookings and accounts are in v1 (D-19, D-22); payments are not |
| Q13 | Hourly hire 2–16 h (today) or 2–24 h? Business Class 4 or 3 passengers; Business Van 7 or 5? Add SUVs and non-Mercedes models? | PRD-12, PRD-14 | Client | Open |
| Q14 | Are prices really all-inclusive (tolls, taxes, fees, gratuity)? Is there a carbon-offset partner? | PRD-15, PRD-16 | Client | Open |

---

## 13. Reference

### Key locations

| What | Where |
| --- | --- |
| Website code | `frontend/` (guide: [`frontend/README.md`](frontend/README.md)) |
| Content admin | `frontend/src/admin/`, routes in `frontend/src/app/admin/` · content model: `frontend/src/admin/lib/content/types.ts` |
| Website content loader (services from the API) | `frontend/src/lib/content/site-services.ts` |
| Booking rules (cities, services, vehicles, capacity, hire hours) | `frontend/src/domain/booking.ts` and `backend/bookings/choices.py` (keep in sync) |
| Translations | `frontend/src/i18n/dictionaries/{en,fr,bg,ar}.ts` |
| Company contact, social links, media | `frontend/src/config/site.ts` |
| Backend | `backend/` · settings `backend/config/settings.py` · apps `core` (health, staff sign-in), `account`, `bookings`, `content` |
| Neon services | `backend/neon.ts` (run `neon` commands from `backend/`) |
| Local secrets | `backend/.env.local` (gitignored), template `backend/.env.example`; `frontend/.env.local`, template `frontend/.env.example` |
| API contract | README [API contract](README.md#api-contract); booking payload in `frontend/README.md#backend-contract` |
| CI/CD | `.github/workflows/frontend-ci.yml`, `frontend-deploy.yml` |
| Design reference | `driveo-creative/` · https://driveo-creative-lab.lovable.app |
| Original company site | https://driveo-elite-flow.base44.app |
| Technical proposal | *Technology Stack & Deployment Architecture, DriveExclusive* (PDF, v1.0) |

### Everyday commands

| Task | Command (from the folder shown) |
| --- | --- |
| Run the website and admin | `frontend/`: `npm run dev` → http://localhost:3000, admin at `/admin` |
| Check the website | `frontend/`: `npm run lint`, `npm run typecheck`, `npm run build` |
| Run the API | `backend/`: `.venv/Scripts/python manage.py runserver` (or `python manage.py runserver` after `conda activate driveexclusive`) |
| Backend tests | `backend/`: `.venv/Scripts/python manage.py test` (creates a test database on Neon; several minutes) |
| Migrate | `backend/`: `.venv/Scripts/python manage.py migrate --database direct` |
| Switch Neon branch | `backend/`: `neon checkout dev` or `neon checkout production` (rewrites `.env.local`) |
| Alerts worker | `backend/`: `.venv/Scripts/celery -A config worker -l info --pool=solo` (needs Redis) |

### Key configuration flags

| Flag | Where | Meaning |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | frontend | Django API base, e.g. `http://localhost:8000/api` |
| `NEXT_PUBLIC_API_MOCK` | frontend | `true` fakes API responses |
| `NEXT_PUBLIC_ADMIN_CONTENT_SOURCE` | frontend | `local` (demo, browser storage) or `api` (Postgres, staff sign-in) |
| `ADMIN_ENABLED` | frontend (runtime) | Production shows `/admin` only when `true`; use only with API mode |
| `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `SESSION_COOKIE_SAMESITE` | backend | Which website origins may call the API and sign staff in |
| `CELERY_TASK_ALWAYS_EAGER` | backend | `true` sends alerts inside the request (local work without Redis) |

### Glossary

| Term | Meaning |
| --- | --- |
| **Booking** | A customer's journey at a fixed price, `DRV-XXXXXX`, pending until staff confirm it |
| **Manage link** | `/booking?ref&token`: the private link in a booking's emails that lets a guest view, change or cancel it |
| **Reference** | Request id shown to the customer, format `DRV-XXXXXX` |
| **Price grid** | The admin's price per service, city and vehicle class; bookings cost exactly this, and the lowest is shown as "From €X" |
| **Mock mode** | Frontend setting that fakes API responses |
| **Demo mode** | Content admin storing content only in the browser |
| **Locale** | Language version of the site: `en`, `fr`, `bg`, `ar` |
| **RTL** | Right-to-left layout, used for Arabic |
| **Honeypot** | Hidden form field only bots fill in, used to drop spam silently |
| **DRF** | Django REST Framework |
| **Celery / Redis** | Background job system and its broker, used for alerts and retries |
| **Capacitor** | Packages a web app as native Android and iOS apps |
| **PWA** | Progressive Web App: the site can be installed to a phone's home screen |
| **Neon / Neon branch** | Managed Postgres and file storage; a branch is an instant copy-on-write copy for dev or staging |
| **Pooled / direct connection** | `DATABASE_URL` (app traffic) and `DATABASE_URL_UNPOOLED` (migrations) |

### Working agreements

- **Documentation:** update this file and the README in the same change as the work.
- **Commits:** Conventional Commits with scopes `frontend`, `backend`, `mobile`, `infra`, `docs`, plus the tracker ID.
- **Branches:** `main` is deployable; work on feature branches through pull requests.
- **Quality gate:** lint, typecheck, build and tests must pass before merge.
- **Design:** the Lovable prototype is the visual reference; agree new designs before building them.

---

## 14. How to maintain this file

Keep it **true, short and current**, and bump **Last updated** at the top.

| When… | Update |
| --- | --- |
| Work starts or finishes | Its status in §7; recount §8 and the header totals; "Recently completed" in §8; §9 |
| New work is identified | Add a row in §7 with the next free ID in its area, a priority and a status |
| A phase or milestone changes | §6 and the header |
| A decision is made | A new `D-xx` row at the top of §11 (and the README decision log) |
| A question is answered | Close it in §12, record the outcome as a decision, unblock the items it named |
| A new risk or issue appears | A new `R-xx` or `KI-xx` row in §10, linked to a tracker ID if there is one |
| Business facts change (services, fleet, cities, contact) | §2, and the code locations in §13 |

Progress bars use 18 blocks; each `█` is about 5.5 %.
