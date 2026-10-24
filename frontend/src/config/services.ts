import { FLEET_VEHICLES, SERVICE_TYPES, type FleetVehicle, type ServiceType } from "@/domain/booking";

/** URL slugs for the service detail pages, e.g. `/services/airport-transfer?lang=en`. */
export const SERVICE_SLUGS: Record<ServiceType, string> = {
  airport_transfer: "airport-transfer",
  point_to_point: "point-to-point",
  hourly_hire: "hourly-hire",
  private_event: "private-events",
};

export function serviceFromSlug(slug: string): ServiceType | undefined {
  return SERVICE_TYPES.find((type) => SERVICE_SLUGS[type] === slug);
}

/** Public path of a service detail page (without `?lang=`). */
export function servicePath(type: ServiceType) {
  return `/services/${SERVICE_SLUGS[type]}`;
}

interface ServiceMedia {
  hero: string;
  overview: string;
  /** Fleet classes in the order they suit this service best. */
  vehicles: readonly FleetVehicle[];
}

export const serviceMedia: Record<ServiceType, ServiceMedia> = {
  airport_transfer: {
    hero: "/media/driveo-journey-poster.jpg",
    overview: "/media/fleet-business-2026.jpg",
    vehicles: FLEET_VEHICLES,
  },
  point_to_point: {
    hero: "/media/paris-hotel-evening.jpg",
    overview: "/media/fleet-first-2026-front.jpg",
    vehicles: ["first_class", "business_class", "business_van"],
  },
  hourly_hire: {
    hero: "/media/london-thames-night.jpg",
    overview: "/media/fleet-business-2026.jpg",
    vehicles: ["business_class", "first_class", "business_van"],
  },
  private_event: {
    hero: "/media/fleet-first-2026-front.jpg",
    overview: "/media/paris-hotel-evening.jpg",
    vehicles: ["first_class", "business_van", "business_class"],
  },
};
