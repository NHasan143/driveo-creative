---
name: Driveo Exclusive
description: Existing chauffeur identity with warm charcoal, ivory, copper-gold accents and editorial serif headings.
colors:
  background: "oklch(14.5% 0.008 55)"
  foreground: "oklch(93% 0.019 78)"
  primary: "oklch(75.5% 0.095 56)"
  secondary: "oklch(19% 0.011 55)"
  muted: "oklch(23% 0.014 55)"
  muted-foreground: "oklch(69% 0.022 73)"
  destructive: "oklch(62% 0.2 25)"
  destructive-foreground: "oklch(98% 0 0)"
  border: "oklch(93% 0.019 78 / 0.12)"
  input: "oklch(93% 0.019 78 / 0.18)"
typography:
  headline:
    fontFamily: "var(--font-fraunces), var(--font-arabic), Georgia, serif"
    fontSize: "clamp(2.65rem, 5vw, 4.8rem)"
    fontWeight: 500
    lineHeight: 0.98
  title:
    fontFamily: "var(--font-fraunces), var(--font-arabic), Georgia, serif"
    fontSize: "1.8rem"
    fontWeight: 500
  body-muted:
    fontFamily: "var(--font-manrope), var(--font-arabic), system-ui, sans-serif"
    fontSize: "0.9rem"
    lineHeight: 1.7
  label:
    fontFamily: "var(--font-space-mono), var(--font-mono-cyrillic), var(--font-arabic), ui-monospace, monospace"
    fontSize: "0.65rem"
    letterSpacing: "0.2em"
  button-label:
    fontFamily: "var(--font-space-mono), var(--font-mono-cyrillic), var(--font-arabic), ui-monospace, monospace"
    fontSize: "0.65rem"
    fontWeight: 700
    letterSpacing: "0.16em"
rounded:
  pill: "999px"
  quote-card: "0.5rem"
spacing:
  section-band: "7rem"
  section-band-phone: "5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    typography: "{typography.button-label}"
    rounded: "{rounded.pill}"
    padding: "0.7rem 1.2rem"
  button-secondary:
    backgroundColor: "color-mix(in oklab, var(--background) 65%, transparent)"
    textColor: "{colors.foreground}"
    typography: "{typography.button-label}"
    rounded: "{rounded.pill}"
    padding: "0.7rem 1.2rem"
  button-secondary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
  quote-card:
    backgroundColor: "color-mix(in oklab, var(--foreground) 94%, transparent)"
    textColor: "{colors.background}"
    rounded: "{rounded.quote-card}"
    padding: "clamp(1.4rem, 4vw, 3rem)"
---

# Design System: Driveo Exclusive

## Overview

This documents the existing application identity preserved by the services redesign. The user requires the same theme, colors and typography, with a modern and elite presentation. No replacement visual identity or named creative metaphor has been established.

Warm charcoal surfaces, ivory text and restrained copper-gold accents support large serif headings, readable sans-serif copy and compact monospaced controls. Photography carries the chauffeur and destination context. The shared quote section reverses the light and dark roles to make the enquiry workflow distinct.

**Key Characteristics:**
- Warm dark surfaces with fine, low-contrast rules.
- Fraunces headings, Manrope copy and Space Mono controls, with existing multilingual fallbacks.
- Pill-shaped actions, rectangular photography and a softly rounded enquiry card.
- Shared navigation and quote behavior across localized pages.

Evidence: `frontend/src/styles/globals.css`, `frontend/src/app/fonts.ts`, shared button and header components, quote styles and the finished services stylesheet. The frontmatter records reused incumbent values; page-specific measurements remain local.

## Colors

### Primary

`primary` is the existing muted copper-gold accent for actions, emphasis, focus and selected navigation. The source aliases `accent` and `ring` resolve to this same token. Primary foreground resolves to `background`.

### Neutral

`background` is warm charcoal; `foreground` is ivory. `secondary` supplies the slightly lighter surface also used by the source's `card` token. `muted` adds another dark surface step, while `muted-foreground` supports descriptions and secondary labels. `border` and `input` are translucent ivory strokes. Secondary and card foreground resolve to `foreground`; accent foreground resolves to `background`.

The quote band uses `foreground` as its background and `background` as its text. Its strokes and secondary copy are existing mixes of the charcoal token. `destructive` is reserved for submission errors; its light foreground token is available in the incumbent palette.

**The Existing Palette Rule.** Preserve the source OKLCH values and semantic aliases; compose localized styles from these variables.

## Typography

The exact font stacks are recorded in frontmatter. Fraunces supplies editorial headings, Manrope supplies running copy, and Space Mono supplies navigation and controls. IBM Plex Mono fills Cyrillic mono glyphs; Noto Kufi Arabic supplies Arabic glyphs. The font loader retains its existing subset and `display: swap` configuration.

The shared headline role is the global section title, with a maximum measure of 18 characters. The title role is the global card heading. The body-muted role records the shared secondary-copy treatment; it is not a universal body-size override. Labels and buttons use uppercase text; the button role has heavier weight and tighter tracking than the general mono label.

The quote heading and services headline have their own scoped sizes. On services, the second headline line uses the accent and lighter italic type; Arabic uses upright emphasis, normal tracking and increased line height. These are surface adaptations rather than new global type tokens.

**The Existing Type Rule.** Retain the established font stacks and language fallbacks when adding or adapting surfaces.

## Layout

The shared content shell is `min(100% - 3rem, 1320px)`, centered with logical inline margins. At widths up to 639px it becomes `min(100% - 2rem, 1320px)`, providing 24px and 16px gutters respectively. Shared section-band vertical spacing is recorded in frontmatter; individual features can have evidenced local spacing.

The header's main row is 5rem high. Below 1280px, navigation occupies a second row with a minimum height of 2.75rem; page content must clear both rows. The quote layout becomes an asymmetric two-column grid at 1024px; its fields become two columns at 768px.

The services opening is a scoped asymmetric layout: a large two-line headline on the left, with the quote action on the right. Below it, one gallery row presents four equally prominent portrait panels (2:3 ratio) on desktop. The personal-quote introduction sits to the right of “Four ways to travel with us” below the gallery, replacing that heading's trailing rule. The hero and section heading stack and the gallery becomes two columns below 1024px; below 640px the gallery becomes one column. Descriptive service rows, detail links, quote actions and inclusions follow. Its wider desktop measure, image ratios, gaps and hero offsets belong to `frontend/src/features/services/services-page.module.css`; they do not replace shared shell or spacing tokens. Preserve logical alignment and the existing right-to-left adaptations.

## Elevation & Depth

Dark content areas rely on surface tone, photography and fine borders. Shared secondary buttons use a translucent background and backdrop blur. The inverted quote card carries a broad diffuse charcoal shadow and a subtle inner highlight; at desktop size it has a slight perspective turn, reversed for right-to-left layouts. Exact shadows, motion and breakpoints are documented in the sidecar rather than added to the token schema.

Shared actions move slightly upward on hover. The services image crop enlarges gently on pointer hover or keyboard focus. Global reduced-motion rules shorten transitions and animations; the services image and disclosure rules additionally remove their transitions and image transforms.

## Shapes

Actions use pill corners. Social controls are circular. Service photography remains rectangular and clipped. The quote card uses a small radius, while its transparent fields retain square corners and bottom borders. These different shapes follow their component roles; there is no blanket card radius for every section.

## Components

### Buttons

The primary action uses copper-gold with charcoal text; the secondary uses an ivory outline, translucent charcoal background and ivory text. Both share uppercase mono type, pill corners and a minimum height of 2.7rem. Hover lifts the action by 2px, and secondary hover adopts the primary colors. Global keyboard focus uses a one-pixel accent outline with a three-pixel offset. Disabled buttons have reduced opacity and no hover translation.

Large and compact sizes remain the existing shared variants. Compact header buttons align with the language control; their tracking and padding reduce on phones.

### Quote card and fields

The enquiry card sits on the inverted ivory band. Its underlined inputs use charcoal text, transparent fill and the existing sans-serif stack. Focus changes the underline to copper-gold and adds a one-pixel underline shadow. Labels use compact bold uppercase mono type. Selects retain their existing arrow treatment; date and time controls use a light native color scheme. Errors use the destructive token; successful submission replaces the form with its confirmation state.

### Navigation

Navigation uses muted uppercase mono labels with accent color for hover and the current page. Its links have a minimum height of 2.75rem. The shared header keeps branding and language/quote controls together; its second navigation row handles narrower layouts. Preserve localized query-parameter links and the existing services menu behavior.

### Social controls

Circular icon links use accent strokes and outlines over translucent charcoal. Hover fills the control with the accent and lifts it; icons retain accessible names in the application.

### Services gallery and details

Each portrait panel is a complete link to its localized service detail page, with a bottom-overlaid service title and details label, plus an outlined circular arrow in the upper logical end corner. A dark lower gradient supports the overlaid labels. Photography uses a small hover/focus crop change with a static reduced-motion treatment. The descriptive rows below the gallery retain their own detail and quote actions. Quote actions preselect the stable service identifier in the shared form, and native disclosure controls expose the existing inclusions. These gallery and detail rules apply to this surface only.

## Do's and Don'ts

### Do:
- **Do** preserve the existing semantic colors, exact font stacks and multilingual fallbacks.
- **Do** reuse shared buttons, navigation, footer and quote components.
- **Do** keep feature-specific measurements scoped to their feature styles.
- **Do** retain keyboard focus, reduced-motion behavior and logical right-to-left layout.

### Don't:
- **Don't** introduce replacement colors or typefaces for the services redesign.
- **Don't** promote the services collection's grid or spacing into global tokens.
- **Don't** change service identifiers, locale links or quote preselection while adapting presentation.
