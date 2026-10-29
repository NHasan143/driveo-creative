/**
 * Content model managed by the admin. These shapes mirror the Django models the
 * backend will expose, so the local store can later be swapped for the API.
 */

export const LOCALES = ["en", "fr", "bg", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  bg: "Български",
  ar: "العربية",
};

/** English is required everywhere; the other languages fall back to it on the website. */
export const DEFAULT_LOCALE: Locale = "en";

export type LocalizedText = Record<Locale, string>;

export type PublishStatus = "published" | "draft";

interface Entity {
  id: string;
  /** URL-safe identifier, e.g. `airport-transfer`. Also the stable API id. */
  slug: string;
  status: PublishStatus;
  /** Position in lists on the website (ascending). */
  order: number;
  updatedAt: string;
}

export const SERVICE_ICONS = ["plane", "route", "clock", "sparkles", "briefcase", "heart", "map", "star"] as const;
export type ServiceIcon = (typeof SERVICE_ICONS)[number];

/** Guide prices are per journey, or per hour for hourly hire. */
export const PRICE_UNITS = ["trip", "hour"] as const;
export type PriceUnit = (typeof PRICE_UNITS)[number];

/** Every guide price is in euros. */
export const PRICE_CURRENCY = "EUR";

/** A guide price for a service with one vehicle class in one city. */
export interface ServicePrice {
  cityId: string;
  vehicleId: string;
  amount: number;
}

export interface Fact {
  value: LocalizedText;
  label: LocalizedText;
}

export interface TitledCopy {
  title: LocalizedText;
  copy: LocalizedText;
}

export interface Service extends Entity {
  icon: ServiceIcon;
  /** Short category label, e.g. "Transfer". */
  label: LocalizedText;
  title: LocalizedText;
  /** One-paragraph description used on cards and the Services page. */
  summary: LocalizedText;
  /** Detail page headline. */
  headline: LocalizedText;
  included: LocalizedText[];
  facts: Fact[];
  overviewTitle: LocalizedText;
  overviewBody: LocalizedText;
  features: TitledCopy[];
  steps: TitledCopy[];
  heroImage: string;
  overviewImage: string;
  /** Vehicle ids, in recommended order. */
  vehicleIds: string[];
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
  priceUnit: PriceUnit;
  /** Shown on the website as "from" prices; customers still get a fixed quote. */
  prices: ServicePrice[];
}

export interface Vehicle extends Entity {
  name: LocalizedText;
  /** Manufacturer model, e.g. "Mercedes-Benz S-Class · 2026". Not translated. */
  model: string;
  description: LocalizedText;
  passengers: number;
  luggage: number;
  features: LocalizedText[];
  image: string;
}

export interface City extends Entity {
  name: LocalizedText;
  /** Service ids offered in this city. */
  serviceIds: string[];
}

export interface Testimonial {
  id: string;
  quote: LocalizedText;
  attribution: LocalizedText;
  published: boolean;
}

export interface SocialLinks {
  linkedin: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  snapchat: string;
}

export interface SiteSettings {
  companyName: string;
  tagline: LocalizedText;
  phone: string;
  email: string;
  /** International format without spaces, e.g. +443300430976. */
  whatsapp: string;
  social: SocialLinks;
  testimonials: Testimonial[];
  updatedAt: string;
}

export interface ContentSnapshot {
  services: Service[];
  vehicles: Vehicle[];
  cities: City[];
  settings: SiteSettings;
}

export function emptyLocalized(): LocalizedText {
  return { en: "", fr: "", bg: "", ar: "" };
}
