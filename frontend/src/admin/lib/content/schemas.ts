import { z } from "zod";

/** Plain-language messages: editors see these under the field. */
const text = (max: number) => z.string().max(max, `Keep this under ${max} characters.`);

/** A translated field. English is required unless `optional`; other languages are always optional. */
export function localized(max = 160, { optional = false } = {}) {
  const english = optional ? text(max) : text(max).refine((value) => value.trim().length > 0, "Please fill this in English.");
  return z.object({ en: english, fr: text(max), bg: text(max), ar: text(max) });
}

export const slugSchema = z
  .string()
  .min(2, "Add a URL slug of at least 2 characters.")
  .max(60, "Keep the slug under 60 characters.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens only, e.g. airport-transfer.");

export const statusSchema = z.enum(["published", "draft"]);

export const imageSchema = z.string().min(1, "Please add a photo.");
