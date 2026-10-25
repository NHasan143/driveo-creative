import { z } from "zod";
import { localized } from "@/admin/lib/content/schemas";
import { emptyLocalized, type SiteSettings, type Testimonial } from "@/admin/lib/content/types";

const socialUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || /^https:\/\/\S+\.\S+/.test(value), "Paste the full link starting with https://, or leave it empty.");

export const settingsSchema = z.object({
  companyName: z.string().trim().min(2, "Add the company name.").max(80),
  tagline: localized(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,20}$/, "Use digits, spaces and an optional leading +, e.g. +44 330 043 0976."),
  email: z.email("Enter a valid email address, e.g. info@driveoexclusive.com."),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/, "Use international format without spaces, e.g. +443300430976."),
  social: z.object({
    linkedin: socialUrl,
    instagram: socialUrl,
    facebook: socialUrl,
    tiktok: socialUrl,
    snapchat: socialUrl,
  }),
  testimonials: z
    .array(
      z.object({
        id: z.string(),
        quote: localized(400),
        attribution: localized(80),
        published: z.boolean(),
      }),
    )
    .max(12),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

export function toSettingsForm(settings: SiteSettings): SettingsFormValues {
  const { updatedAt: _updatedAt, ...rest } = settings;
  return rest;
}

export function newTestimonial(): Testimonial {
  return {
    id: `testimonial-${Math.random().toString(36).slice(2, 8)}`,
    quote: emptyLocalized(),
    attribution: emptyLocalized(),
    published: false,
  };
}
