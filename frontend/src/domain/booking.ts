/**
 * Booking domain vocabulary shared by the marketing sections and the booking form.
 * Ids are stable API values; human-readable labels live in the i18n dictionaries.
 */

export const CITIES = ["london", "paris", "bulgaria", "dubai"] as const;
export type City = (typeof CITIES)[number];

export const SERVICE_TYPES = [
  "airport_transfer",
  "point_to_point",
  "hourly_hire",
  "private_event",
] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const FLEET_VEHICLES = ["business_class", "first_class", "business_van"] as const;
export type FleetVehicle = (typeof FLEET_VEHICLES)[number];


export interface VehicleCapacity {
  passengers: number;
  luggage: number;
}

const STANDARD_CAPACITY: VehicleCapacity = { passengers: 4, luggage: 3 };
const VAN_CAPACITY: VehicleCapacity = { passengers: 7, luggage: 8 };

export function getVehicleCapacity(vehicle: FleetVehicle | ""): VehicleCapacity {
  return vehicle === "business_van" ? VAN_CAPACITY : STANDARD_CAPACITY;
}

export const HIRE_HOURS = { min: 2, max: 16 } as const;
