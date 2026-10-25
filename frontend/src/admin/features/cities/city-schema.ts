import { z } from "zod";
import type { Draft } from "@/admin/lib/content/repository";
import { localized, slugSchema, statusSchema } from "@/admin/lib/content/schemas";
import { emptyLocalized, type City } from "@/admin/lib/content/types";

export const citySchema = z.object({
  id: z.string().optional(),
  slug: slugSchema,
  status: statusSchema,
  name: localized(40),
  serviceIds: z.array(z.string()).min(1, "Choose at least one service offered in this city."),
});

export type CityFormValues = z.infer<typeof citySchema>;

export function toCityForm(city: City | null, allServiceIds: string[] = []): CityFormValues {
  if (city) {
    const { order: _order, updatedAt: _updatedAt, ...rest } = city;
    return rest;
  }
  // New cities usually offer the full menu; editors untick what doesn't apply.
  return { slug: "", status: "draft", name: emptyLocalized(), serviceIds: allServiceIds };
}

export function duplicateCity(city: City): Draft<City> {
  const { id: _id, order: _order, updatedAt: _updatedAt, ...rest } = city;
  return {
    ...structuredClone(rest),
    slug: `${city.slug}-copy`,
    status: "draft",
    name: { ...city.name, en: `${city.name.en} (copy)` },
  };
}
