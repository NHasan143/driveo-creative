import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { seed } from "@/admin/lib/content/seed";
import type { LocalizedText, Service, ServiceIcon } from "@/admin/lib/content/types";
import { env } from "@/config/env";
import { serviceMedia } from "@/config/services";
import { FLEET_VEHICLES, SERVICE_TYPES, type FleetVehicle, type ServiceType } from "@/domain/booking";
import type { Locale } from "@/i18n/config";

/**
 * Services as the website shows them, managed in the content admin (/admin).
 *
 * Published services come from the Django API (`/api/v1/content/published/`)
 * and are cached for about a minute, so admin changes appear on the site
 * without a rebuild. In mock mode, or when the API can't be reached, the site
 * falls back to its built-in copy (the same data the admin was seeded from).
 */
export interface SiteService {
  id: string;
  slug: string;
  /** Public path of the detail page, without `?lang=`. */
  path: string;
  /**
   * The quote form's service id, for the four services the booking rules know
   * (`airport_transfer`, …). Null for services added in the admin: their quote
   * form starts without a service selected.
   */
  bookingType: ServiceType | null;
  icon: ServiceIcon;
  label: string;
  title: string;
  summary: string;
  headline: string;
  included: string[];
  facts: { value: string; label: string }[];
  overviewTitle: string;
  overviewBody: string;
  features: { title: string; copy: string }[];
  steps: { title: string; copy: string }[];
  heroImage: string;
  overviewImage: string;
  /** Portrait photo for the Services gallery; the hero photo for services added in the admin. */
  galleryImage: string;
  vehicles: FleetVehicle[];
  seoTitle: string;
  seoDescription: string;
}

/** API base for server-side requests; inside Docker this can be an internal address. */
const API_BASE = (process.env.API_INTERNAL_BASE_URL ?? env.apiBaseUrl).replace(/\/$/, "");

async function loadPublishedServices(): Promise<Service[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("content");

  if (env.apiMock) return seed.services;
  try {
    const response = await fetch(`${API_BASE}/v1/content/published/`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as { services?: Service[] };
    if (!Array.isArray(data.services)) throw new Error("Response has no services list");
    return [...data.services].sort((a, b) => a.order - b.order);
  } catch (error) {
    console.warn(`[content] Published services unavailable, using built-in copy: ${String(error)}`);
    return seed.services;
  }
}

/** The visitor's language, falling back to English when a translation is empty. */
function pick(text: LocalizedText | undefined, locale: Locale) {
  return text?.[locale]?.trim() || text?.en?.trim() || "";
}

function bookingTypeOf(id: string): ServiceType | null {
  return (SERVICE_TYPES as readonly string[]).includes(id) ? (id as ServiceType) : null;
}

function toSiteService(service: Service, locale: Locale): SiteService {
  const bookingType = bookingTypeOf(service.id);
  const vehicles = service.vehicleIds.filter((id): id is FleetVehicle =>
    (FLEET_VEHICLES as readonly string[]).includes(id),
  );

  return {
    id: service.id,
    slug: service.slug,
    path: `/services/${service.slug}`,
    bookingType,
    icon: service.icon,
    label: pick(service.label, locale),
    title: pick(service.title, locale),
    summary: pick(service.summary, locale),
    headline: pick(service.headline, locale) || pick(service.title, locale),
    included: service.included.map((item) => pick(item, locale)).filter(Boolean),
    facts: service.facts
      .map((fact) => ({ value: pick(fact.value, locale), label: pick(fact.label, locale) }))
      .filter((fact) => fact.value && fact.label),
    overviewTitle: pick(service.overviewTitle, locale),
    overviewBody: pick(service.overviewBody, locale),
    features: service.features
      .map((feature) => ({ title: pick(feature.title, locale), copy: pick(feature.copy, locale) }))
      .filter((feature) => feature.title),
    steps: service.steps
      .map((step) => ({ title: pick(step.title, locale), copy: pick(step.copy, locale) }))
      .filter((step) => step.title),
    heroImage: service.heroImage || serviceMedia.airport_transfer.hero,
    overviewImage: service.overviewImage || service.heroImage || serviceMedia.airport_transfer.overview,
    galleryImage: bookingType ? serviceMedia[bookingType].collection : service.heroImage,
    vehicles: vehicles.length > 0 ? vehicles : [...FLEET_VEHICLES],
    seoTitle: pick(service.seoTitle, locale) || pick(service.title, locale),
    seoDescription: pick(service.seoDescription, locale) || pick(service.summary, locale),
  };
}

export async function getSiteServices(locale: Locale): Promise<SiteService[]> {
  const services = await loadPublishedServices();
  return services.map((service) => toSiteService(service, locale));
}

export async function getSiteService(locale: Locale, slug: string): Promise<SiteService | undefined> {
  return (await getSiteServices(locale)).find((service) => service.slug === slug);
}

/** What the header's Services menu needs; plain data, so it can cross into client components. */
export interface NavService {
  slug: string;
  path: string;
  title: string;
  icon: ServiceIcon;
}

export function toNavServices(services: SiteService[]): NavService[] {
  return services.map(({ slug, path, title, icon }) => ({ slug, path, title, icon }));
}
