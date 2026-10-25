import { serviceMedia, SERVICE_SLUGS } from "@/config/services";
import { siteConfig } from "@/config/site";
import { CITIES, FLEET_VEHICLES, getVehicleCapacity, SERVICE_TYPES, type ServiceType } from "@/domain/booking";
import { fleetMedia } from "@/features/fleet/fleet-media";
import { ar } from "@/i18n/dictionaries/ar";
import { bg } from "@/i18n/dictionaries/bg";
import { en, type Dictionary } from "@/i18n/dictionaries/en";
import { fr } from "@/i18n/dictionaries/fr";
import { LOCALES, type ContentSnapshot, type LocalizedText, type ServiceIcon } from "./types";

/**
 * The admin's starting content, built from the website's own dictionaries and
 * config, so it always opens with the live copy in all four languages.
 */

const DICTIONARIES: Record<(typeof LOCALES)[number], Dictionary> = { en, fr, bg, ar };
const SEEDED_AT = "2026-10-25T00:00:00.000Z";

/** Reads the same value from every dictionary. */
function loc(get: (dictionary: Dictionary) => string): LocalizedText {
  return Object.fromEntries(LOCALES.map((locale) => [locale, get(DICTIONARIES[locale])])) as LocalizedText;
}

/** Zips a list that exists in every dictionary into one entry per item. */
function locList<T, R>(get: (dictionary: Dictionary) => readonly T[], map: (pick: (field: (item: T) => string) => LocalizedText) => R): R[] {
  return get(en).map((_, index) =>
    map((field) => loc((dictionary) => field(get(dictionary)[index]))),
  );
}

const SERVICE_ICONS: Record<ServiceType, ServiceIcon> = {
  airport_transfer: "plane",
  point_to_point: "route",
  hourly_hire: "clock",
  private_event: "sparkles",
};

export const seed: ContentSnapshot = {
  services: SERVICE_TYPES.map((key, order) => {
    const detail = (d: Dictionary) => d.pages.serviceDetail.items[key];
    return {
      id: key,
      slug: SERVICE_SLUGS[key],
      status: "published",
      order,
      updatedAt: SEEDED_AT,
      icon: SERVICE_ICONS[key],
      label: loc((d) => d.services.items[key].label),
      title: loc((d) => d.services.items[key].title),
      summary: loc((d) => d.services.items[key].copy),
      headline: loc((d) => detail(d).title),
      included: locList((d) => d.pages.services.included[key], (pick) => pick((item) => item)),
      facts: locList((d) => detail(d).facts, (pick) => ({ value: pick((f) => f.value), label: pick((f) => f.label) })),
      overviewTitle: loc((d) => detail(d).overviewTitle),
      overviewBody: loc((d) => detail(d).overviewBody),
      features: locList((d) => detail(d).features, (pick) => ({ title: pick((f) => f.title), copy: pick((f) => f.copy) })),
      steps: locList((d) => detail(d).steps, (pick) => ({ title: pick((f) => f.title), copy: pick((f) => f.copy) })),
      heroImage: serviceMedia[key].hero,
      overviewImage: serviceMedia[key].overview,
      vehicleIds: [...serviceMedia[key].vehicles],
      seoTitle: loc((d) => detail(d).meta.title),
      seoDescription: loc((d) => detail(d).meta.description),
    };
  }),

  vehicles: FLEET_VEHICLES.map((key, order) => ({
    id: key,
    slug: key.replace(/_/g, "-"),
    status: "published",
    order,
    updatedAt: SEEDED_AT,
    name: loc((d) => d.fleet.items[key].title),
    model: fleetMedia[key].model,
    description: loc((d) => d.fleet.items[key].copy),
    ...getVehicleCapacity(key),
    features: locList((d) => d.pages.fleet.features[key], (pick) => pick((item) => item)),
    image: fleetMedia[key].src,
  })),

  cities: CITIES.map((key, order) => ({
    id: key,
    slug: key,
    status: "published",
    order,
    updatedAt: SEEDED_AT,
    name: loc((d) => d.cities.names[key]),
    serviceIds: [...SERVICE_TYPES],
  })),

  settings: {
    companyName: siteConfig.legalName,
    tagline: loc((d) => d.footer.tagline),
    phone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    whatsapp: siteConfig.contact.phoneHref.replace("tel:", ""),
    social: { ...siteConfig.social },
    testimonials: [
      {
        id: "testimonial-1",
        quote: loc((d) => d.testimonial.quote),
        attribution: loc((d) => d.testimonial.note),
        published: true,
      },
    ],
    updatedAt: SEEDED_AT,
  },
};
