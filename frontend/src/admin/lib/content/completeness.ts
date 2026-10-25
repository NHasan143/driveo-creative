import { LOCALES, type Locale, type LocalizedText } from "./types";

export type Coverage = Record<Locale, { filled: number; total: number }>;

function isLocalized(value: unknown): value is LocalizedText {
  return (
    typeof value === "object" &&
    value !== null &&
    LOCALES.every((locale) => typeof (value as Record<string, unknown>)[locale] === "string")
  );
}

/** Walks any content record and counts, per language, how many translatable fields are filled in. */
export function coverageOf(record: unknown, coverage: Coverage = emptyCoverage()): Coverage {
  if (isLocalized(record)) {
    for (const locale of LOCALES) {
      coverage[locale].total += 1;
      if (record[locale].trim()) coverage[locale].filled += 1;
    }
  } else if (Array.isArray(record)) {
    record.forEach((item) => coverageOf(item, coverage));
  } else if (typeof record === "object" && record !== null) {
    Object.values(record).forEach((value) => coverageOf(value, coverage));
  }
  return coverage;
}

export function emptyCoverage(): Coverage {
  return Object.fromEntries(LOCALES.map((l) => [l, { filled: 0, total: 0 }])) as Coverage;
}

export function percent({ filled, total }: { filled: number; total: number }) {
  return total === 0 ? 100 : Math.round((filled / total) * 100);
}
