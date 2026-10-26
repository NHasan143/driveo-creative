---
version: 1
slug: "rc-admin-features-dashboard-dashboard-tsx-915cdb78"
primary_target: "frontend/src/admin/features/dashboard/dashboard.tsx"
related_targets: ["frontend/src/admin/components/layout/app-shell.tsx","frontend/src/admin/features/dashboard/dashboard.module.css","frontend/src/admin/features/dashboard/dashboard-fleet.ts"]
---

# Admin dashboard

Primary target: `frontend/src/admin/features/dashboard/dashboard.tsx`
Related targets: `frontend/src/admin/components/layout/app-shell.tsx`, `frontend/src/admin/features/dashboard/dashboard.module.css`, `frontend/src/admin/features/dashboard/dashboard-fleet.ts`
Mode: Operate

## Direction contract

THESIS: Implement the user's approved Fleet registry mockup, replacing the rejected panel grid with a fleet-led working registry.

OWN-WORLD: Same existing admin typography and semantic warm-neutral/copper light and dark tokens. Photography comes from the existing vehicle records; no replacement images, palette, charts, or decorative horizontal rules.

STORY: Scan the three content counts, see every fleet class in the requested order, open its existing editor, and continue to recent work, quick actions, attention and translations.

FIRST VIEWPORT: Slim dark left navigation; Dashboard title and New service at the top; three inline counts. Wide left registry with thumbnail/name/model/status/Edit rows Business Class, First Class, Business Van, and recent activity beneath. Narrow right utility column holds quick actions, attention and translations. Typography and spacing follow the approved mockup; mobile adapts rows and stacks the columns.

FORM: Fleet registry selected in browser question 862805ee (option fleet-registry, buildPath comp); approval recovered in the user's follow-up. Approved comp: `.impeccable/mocks/decision/admin-fleet-registry.png`. Existing real photos replace illustrative mockup vehicle images; actual data-driven statuses and the full six-item recent feed remain. These product-truth adaptations preserve the composition.

FINISH: Built and manually reviewed against the approved Fleet registry comp. Manual disposition: “Ship the implementation,” with no material implementation fixes and the documented existing-photography exception. Automated completion remains refused: the plate gate failed and subsequent automated phases remain pending.

## Built registry

The Dashboard title and existing New service action lead into three inline linked counts. A wider left column contains the complete Fleet registry followed by the existing six-item Recently updated feed. The narrower utility column holds Quick actions, Needs attention, and Translations. Sections share the page background; spacing and typography group the work without a panel grid or decorative horizontal rules.

Desktop workspace columns use a 2.15:1 ratio with a 280px right-column minimum and a 56px gap. Each fleet row places an existing vehicle thumbnail, linked class name, actual model text, data-driven Published/Draft status, and Edit action together. At 1279px and below, columns narrow to 1.8:1 with a 240px minimum and 32px gap; the row image spans two lines while status and Edit sit below the details. At 767px and below, counts become two columns and sections stack Fleet, Recently updated, Quick actions, Needs attention, then Translations. Smaller image widths keep fleet rows usable down to the checked 320px viewport.

The shell retains a dark sidebar, existing logo, demo notice, website link, mobile drawer, theme toggle, and sign-out behavior. Its desktop sidebar is 235px, header is 64px, and content container has a 1440px maximum width. There is no header separator.

## Fleet completeness and product truth

`orderDashboardFleet` returns a sorted copy of every vehicle record, independently of recency. Canonical IDs establish Business Class, First Class, Business Van order; normalized slugs provide the same ranking when API records use different IDs. Extra vehicle classes remain after the canonical classes, ordered by their existing `order` values. Input arrays are not mutated. An empty collection shows the existing creation action alongside an explanatory registry message.

The registry uses each record's actual photo, English class name, model, publication state, and ID-based editor route. Vehicle names and Edit actions both open the existing editor. The six-item recent feed keeps its original recency sorting and is not the source of fleet completeness. Service, vehicle-class and city counts and their details, quick actions, attention calculations, and four translation values remain.

Existing production JPEGs are retained in place of the approved comp's illustrative studio photographs. Actual model details, including year/color text present in the records, remain. The approved mock is a design reference, not a new shipping asset. Inspection-only PNG plate copies are tooling evidence; no new production imagery or logo was introduced.

## Visual authority and scope

The unchanged admin stylesheet remains the authority for Fraunces display type, Manrope UI type with existing Arabic/system fallbacks, and warm-neutral/copper semantic tokens in both light and dark themes. Dashboard styling stays in its CSS module; the fleet ordering helper stays local to the dashboard. Shared shell presentation changes do not redesign list/editor content or alter content APIs and editing features.

This is an extension of the established admin world implementing the selected Fleet registry composition. `DESIGN.md`, `.impeccable/design.json`, public-site styling, and shared design tokens remain preserved. Previously disclosed documentation drift was not repaired.

## Manual review and automation limitation

The independent finish reviewer, `impeccable_registry_reviewer`, reviewed all five final captures, the approved comp, side-by-side comparison, and flagged region crops. Disposition: **“Ship the implementation.”** No material implementation fixes remained. The manual approval covers the source implementation, responsive visual review, accessibility, and reported functional checks, accepting existing product photography as a documented exception.

The [final comp-diff report](../review/admin/diff/final/report.json) records an overall score of 0.8243 (about 82%) with a full-comparison `match` verdict. This does **not** mean the automated workflow passed. The individual photo plate gate failed because the existing JPEG photographs differ from the comp's illustrative studio images. The CLI refused automated finish; the plates phase remains open, later phases remain pending, and no failed gate was forced to pass. `.impeccable/build/state.json` records a separate `manualFinishReview` while preserving those automation failures.

## Validation and visual evidence

- `npm run lint`, `npm run typecheck`, and `git diff --check` passed; the mechanical detector returned `[]`.
- Live browser checks passed for theme switching, mobile drawer navigation to Services with dismissal, New service, and all three fleet Edit forms.
- The original 15 dashboard links plus six fleet links were present. Fleet order was Business Class, First Class, Business Van; all four translation values were preserved.
- Overflow checks passed at widths of 320, 768, 1024, and 1280px.
- Pure ordering regression checks covered shuffled input and recency, API IDs ranked via slugs, extra vehicles, an empty list, and immutable input.

Final browser captures:

- [Comp-sized implementation, 1505×1045](../review/admin/registry-comp.png)
- [Desktop, light, 1440px full page](../review/admin/registry-desktop.png)
- [Desktop, dark](../review/admin/registry-desktop-dark.png)
- [Mobile, light, 390px full page](../review/admin/registry-mobile.png)
- [Mobile, dark](../review/admin/registry-mobile-dark.png)

Approval evidence is `.impeccable/mocks/decision/admin-fleet-registry.json` (`approved: true`, browser selection 862805ee) alongside the approved comp. Review captures and comparison crops are evidence artifacts, not shipping product imagery.

## Dashboard metric removal

At the user's request, the Testimonials summary metric was removed. The desktop count strip and loading placeholders now contain three items. This scoped change passed TypeScript and targeted ESLint checks; earlier registry screenshots and browser-link totals above predate this removal.

## Contact editing removal

At the user's request, the dashboard shortcut for updating contact details and the phone, email and WhatsApp fields in Site settings were removed. The settings form omits those fields from editable values and merges existing contact values into other settings saves. Company, social and testimonial settings remain available. TypeScript, targeted ESLint and a browser save check passed; the browser check confirmed missing contact controls, successful company editing, preserved contact values and the removed shortcut, then restored its isolated demo fixture.

## Complete Site settings removal

The user clarified that all site information is fixed in the frontend. Site settings is now removed entirely from admin navigation, dashboard recent activity, metadata, settings routes and editor files, query hooks and frontend repository read/write/reset controls. Translation coverage now counts only editable services, vehicles and cities. Existing storage records and public frontend configuration are preserved. The old `/admin/settings` URL returns HTTP 404. TypeScript, full ESLint and read-only browser checks passed, including desktop/mobile navigation, the removed URL, dashboard fleet/coverage rendering and the three remaining content list screens.
