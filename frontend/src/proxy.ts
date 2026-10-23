import { NextResponse, type NextRequest } from "next/server";
import {
  defaultLocale,
  hasLocale,
  LANG_QUERY_PARAM,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  type Locale,
} from "@/i18n/config";

/** Picks the best supported locale: saved choice first, then Accept-Language. */
function resolveLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (hasLocale(saved)) return saved;

  const preferred = (request.headers.get("accept-language") ?? "")
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q)
    .map(({ lang }) => lang)
    .find(hasLocale);

  return preferred ?? defaultLocale;
}

/** Saves an explicit choice; skipped when unchanged so cached pages stay cookie-free. */
function rememberLocale(response: NextResponse, request: NextRequest, locale: Locale) {
  if (request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
  }
  return response;
}

/**
 * Public URLs carry the language as a query parameter: `/?lang=fr`.
 * Internally each language is still a statically generated `app/[locale]`
 * route, so a valid `?lang=` request is rewritten to `/fr` behind the scenes.
 *
 * Everything else is redirected to that canonical form:
 *   `/`             → `/?lang=<cookie | Accept-Language | en>`
 *   `/bg`, `/bg/x`  → `/?lang=bg`, `/x?lang=bg`   (old path-style links)
 *   `/?lang=EN`     → `/?lang=en`
 */
export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const [, firstSegment, ...rest] = url.pathname.split("/");
  const pathLocale = hasLocale(firstSegment) ? firstSegment : null;
  const subPath = (pathLocale ? rest : [firstSegment, ...rest]).filter(Boolean).join("/");

  const rawLang = url.searchParams.get(LANG_QUERY_PARAM);
  const requested = rawLang?.toLowerCase();

  // Already canonical: serve the prerendered locale route without changing the URL.
  if (!pathLocale && hasLocale(requested) && rawLang === requested) {
    const internal = url.clone();
    internal.pathname = `/${requested}${subPath ? `/${subPath}` : ""}`;
    return rememberLocale(NextResponse.rewrite(internal), request, requested);
  }

  const explicit = hasLocale(requested) ? requested : pathLocale;
  const target = explicit ?? resolveLocale(request);
  const canonical = url.clone();
  canonical.pathname = `/${subPath}`;
  canonical.searchParams.set(LANG_QUERY_PARAM, target);

  const response = NextResponse.redirect(canonical);
  return explicit ? rememberLocale(response, request, explicit) : response;
}

export const config = {
  // Skip Next internals, metadata routes and any file with an extension (public assets).
  matcher: ["/((?!_next|api|manifest.webmanifest|robots.txt|sitemap.xml|.*\\..*).*)"],
};
