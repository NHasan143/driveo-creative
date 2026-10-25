import { z } from "zod";
import { imageSchema, localized, slugSchema, statusSchema } from "@/admin/lib/content/schemas";
import { emptyLocalized, SERVICE_ICONS, type Service } from "@/admin/lib/content/types";
import type { Draft } from "@/admin/lib/content/repository";

const titledCopy = z.object({ title: localized(80), copy: localized(220) });

export const serviceSchema = z.object({
  id: z.string().optional(),
  slug: slugSchema,
  status: statusSchema,
  icon: z.enum(SERVICE_ICONS),
  label: localized(30),
  title: localized(60),
  summary: localized(320),
  headline: localized(90),
  included: z.array(localized(90)).max(8),
  facts: z.array(z.object({ value: localized(16), label: localized(60) })).max(6),
  overviewTitle: localized(90),
  overviewBody: localized(700),
  features: z.array(titledCopy).max(8),
  steps: z.array(titledCopy).max(6),
  heroImage: imageSchema,
  overviewImage: imageSchema,
  vehicleIds: z.array(z.string()),
  seoTitle: localized(70, { optional: true }),
  seoDescription: localized(170, { optional: true }),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

export function toServiceForm(service: Service | null): ServiceFormValues {
  if (service) {
    const { order: _order, updatedAt: _updatedAt, ...rest } = service;
    return rest;
  }
  return {
    slug: "",
    status: "draft",
    icon: "sparkles",
    label: emptyLocalized(),
    title: emptyLocalized(),
    summary: emptyLocalized(),
    headline: emptyLocalized(),
    included: [],
    facts: [],
    overviewTitle: emptyLocalized(),
    overviewBody: emptyLocalized(),
    features: [],
    steps: [],
    heroImage: "",
    overviewImage: "",
    vehicleIds: [],
    seoTitle: emptyLocalized(),
    seoDescription: emptyLocalized(),
  };
}

export function duplicateService(service: Service): Draft<Service> {
  const { id: _id, order: _order, updatedAt: _updatedAt, ...rest } = service;
  return {
    ...structuredClone(rest),
    slug: `${service.slug}-copy`,
    status: "draft",
    title: { ...service.title, en: `${service.title.en} (copy)` },
  };
}
