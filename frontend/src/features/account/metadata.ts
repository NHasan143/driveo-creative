import "server-only";

import type { Metadata } from "next";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { buildPageMetadata } from "@/lib/seo/metadata";

/** Account pages are personal: never indexed, and absent from the sitemap. */
export async function accountMetadata(path: string, title?: string): Promise<Metadata> {
  const locale = await getLocale();
  const { account } = await getDictionary(locale);
  const meta = title ? { ...account.meta, title: `${title} | Driveo Exclusive` } : account.meta;
  return {
    ...buildPageMetadata(locale, meta, path),
    robots: { index: false, follow: false },
  };
}
