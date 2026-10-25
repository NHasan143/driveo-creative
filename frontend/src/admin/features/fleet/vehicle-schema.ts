import { z } from "zod";
import type { Draft } from "@/admin/lib/content/repository";
import { imageSchema, localized, slugSchema, statusSchema } from "@/admin/lib/content/schemas";
import { emptyLocalized, type Vehicle } from "@/admin/lib/content/types";

const capacity = (label: string, min: number, max: number) =>
  z
    .number({ message: `Enter the number of ${label}.` })
    .int(`${label[0].toUpperCase()}${label.slice(1)} must be a whole number.`)
    .min(min, `At least ${min} ${label}.`)
    .max(max, `No more than ${max} ${label}.`);

export const vehicleSchema = z.object({
  id: z.string().optional(),
  slug: slugSchema,
  status: statusSchema,
  name: localized(40),
  model: z.string().trim().min(2, "Add the manufacturer model, e.g. Mercedes-Benz S-Class.").max(60),
  description: localized(320),
  passengers: capacity("passengers", 1, 16),
  luggage: capacity("luggage items", 0, 20),
  features: z.array(localized(60)).max(8),
  image: imageSchema,
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;

export function toVehicleForm(vehicle: Vehicle | null): VehicleFormValues {
  if (vehicle) {
    const { order: _order, updatedAt: _updatedAt, ...rest } = vehicle;
    return rest;
  }
  return {
    slug: "",
    status: "draft",
    name: emptyLocalized(),
    model: "",
    description: emptyLocalized(),
    passengers: 4,
    luggage: 3,
    features: [],
    image: "",
  };
}

export function duplicateVehicle(vehicle: Vehicle): Draft<Vehicle> {
  const { id: _id, order: _order, updatedAt: _updatedAt, ...rest } = vehicle;
  return {
    ...structuredClone(rest),
    slug: `${vehicle.slug}-copy`,
    status: "draft",
    name: { ...vehicle.name, en: `${vehicle.name.en} (copy)` },
  };
}
