import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { seed } from "@/admin/lib/content/seed";
import type { City as AdminCity, LocalizedText, PriceUnit, Service, ServiceIcon, Vehicle } from "@/admin/lib/content/types";
import { env } from "@/config/env";
import { serviceMedia } from "@/config/services";
import { CITIES, FLEET_VEHICLES, SERVICE_TYPES, type City, type FleetVehicle, type ServiceType } from "@/domain/booking";
import { fleetMedia } from "@/features/fleet/fleet-media";
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
   * The booking form's service id, for the four services the booking rules know
   * (`airport_transfer`, …). Null for services added in the admin: their booking
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
  /** Lowest guide price in euros across published cities and vehicles; null when none is set. */
  fromPrice: number | null;
  priceUnit: PriceUnit;
}

/** Fleet vehicle as shown on the website, managed in the content admin (/admin). */
export interface SiteVehicle {
  id: string;
  slug: string;
  vehicleKey: FleetVehicle | null;
  name: string;
  model: string;
  description: string;
  passengers: number;
  luggage: number;
  features: string[];
  image: string;
}

/** Operating city as shown on the website, managed in the content admin (/admin). */
export interface SiteCity {
  id: string;
  slug: string;
  cityKey: City | null;
  name: string;
  serviceIds: string[];
}

/** API base for server-side requests; inside Docker this can be an internal address. */
const API_BASE = (process.env.API_INTERNAL_BASE_URL ?? env.apiBaseUrl).replace(/\/$/, "");

interface PublishedContent {
  services: Service[];
  vehicles: Vehicle[];
  cities: AdminCity[];
}

async function loadPublishedContent(): Promise<PublishedContent> {
  "use cache";
  cacheLife("minutes");
  cacheTag("content");

  if (env.apiMock) {
    return {
      services: seed.services,
      vehicles: seed.vehicles,
      cities: seed.cities,
    };
  }

  try {
    const response = await fetch(`${API_BASE}/v1/content/published/`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as {
      services?: Service[];
      vehicles?: Vehicle[];
      cities?: AdminCity[];
    };
    return {
      services: Array.isArray(data.services)
        ? [...data.services].sort((a, b) => a.order - b.order)
        : seed.services,
      vehicles: Array.isArray(data.vehicles)
        ? [...data.vehicles].sort((a, b) => a.order - b.order)
        : seed.vehicles,
      cities: Array.isArray(data.cities)
        ? [...data.cities].sort((a, b) => a.order - b.order)
        : seed.cities,
    };
  } catch (error) {
    console.warn(`[content] Published content unavailable, using built-in copy: ${String(error)}`);
    return {
      services: seed.services,
      vehicles: seed.vehicles,
      cities: seed.cities,
    };
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
    fromPrice: service.prices?.length ? Math.min(...service.prices.map((price) => price.amount)) : null,
    priceUnit: service.priceUnit ?? "trip",
  };
}

function toSiteVehicle(vehicle: Vehicle, locale: Locale): SiteVehicle {
  const vehicleKey = (FLEET_VEHICLES as readonly string[]).includes(vehicle.id)
    ? (vehicle.id as FleetVehicle)
    : null;
  const defaultImage = vehicleKey ? fleetMedia[vehicleKey].src : "/media/fleet-first-2026-front.jpg";
  return {
    id: vehicle.id,
    slug: vehicle.slug,
    vehicleKey,
    name: pick(vehicle.name, locale),
    model: vehicle.model || (vehicleKey ? fleetMedia[vehicleKey].model : ""),
    description: pick(vehicle.description, locale),
    passengers: vehicle.passengers,
    luggage: vehicle.luggage,
    features: (vehicle.features ?? []).map((f) => pick(f, locale)).filter(Boolean),
    image: vehicle.image || defaultImage,
  };
}

function toSiteCity(city: AdminCity, locale: Locale): SiteCity {
  const cityKey = (CITIES as readonly string[]).includes(city.id) ? (city.id as City) : null;
  return {
    id: city.id,
    slug: city.slug,
    cityKey,
    name: pick(city.name, locale),
    serviceIds: city.serviceIds ?? [],
  };
}

export async function getSiteServices(locale: Locale): Promise<SiteService[]> {
  const { services } = await loadPublishedContent();
  return services.map((service) => toSiteService(service, locale));
}

export async function getSiteService(locale: Locale, slug: string): Promise<SiteService | undefined> {
  return (await getSiteServices(locale)).find((service) => service.slug === slug);
}

export async function getSiteFleet(locale: Locale): Promise<SiteVehicle[]> {
  const { vehicles } = await loadPublishedContent();
  return vehicles.map((vehicle) => toSiteVehicle(vehicle, locale));
}

export async function getSiteCities(locale: Locale): Promise<SiteCity[]> {
  const { cities } = await loadPublishedContent();
  return cities.map((city) => toSiteCity(city, locale));
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

/** A price key for the booking form, e.g. "london:first_class". */
export type PriceKey = `${City}:${FleetVehicle}`;

/**
 * The admin's price grid per bookable service, for the cities and vehicles the
 * booking form offers. Plain data for the client. The API prices every booking
 * itself from the same grid (backend/bookings/pricing.py).
 */
export type ServicePrices = Partial<Record<ServiceType, { unit: PriceUnit; amounts: Partial<Record<PriceKey, number>> }>>;

export async function getServicePrices(): Promise<ServicePrices> {
  const grid: ServicePrices = {};
  const { services } = await loadPublishedContent();
  for (const service of services) {
    const type = bookingTypeOf(service.id);
    if (!type) continue;
    const amounts: Partial<Record<PriceKey, number>> = {};
    for (const price of service.prices ?? []) {
      const city = CITIES.find((id) => id === price.cityId);
      const vehicle = FLEET_VEHICLES.find((id) => id === price.vehicleId);
      if (city && vehicle) amounts[`${city}:${vehicle}`] = price.amount;
    }
    grid[type] = { unit: service.priceUnit ?? "trip", amounts };
  }
  return grid;
}

/** The lowest price for one car on one service, across every city; null when it has none. */
export function lowestVehiclePrice(prices: ServicePrices, service: ServiceType, vehicle: FleetVehicle) {
  const grid = prices[service];
  if (!grid) return null;
  const amounts = Object.entries(grid.amounts)
    .filter(([key]) => key.endsWith(`:${vehicle}`))
    .map(([, amount]) => amount as number);
  return amounts.length > 0 ? { amount: Math.min(...amounts), unit: grid.unit } : null;
}
