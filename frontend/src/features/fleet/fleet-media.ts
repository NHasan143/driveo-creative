import type { FleetVehicle } from "@/domain/booking";

export interface FleetMedia {
  src: string;
  model: string;
  width: number;
  height: number;
}

export const fleetMedia: Record<FleetVehicle, FleetMedia> = {
  business_class: {
    src: "/media/fleet-business-2026.jpg",
    model: "Mercedes-Benz E-Class · 2026",
    width: 1536,
    height: 1152,
  },
  first_class: {
    src: "/media/fleet-first-2026-front.jpg",
    model: "Mercedes-Benz S-Class · 2026",
    width: 1200,
    height: 896,
  },
  business_van: {
    src: "/media/fleet-van-vle.jpg",
    model: "Mercedes-Benz VLE · Black",
    width: 1536,
    height: 1152,
  },
};
