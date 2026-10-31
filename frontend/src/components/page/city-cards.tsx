import { MapPin } from "lucide-react";
import { BookButton } from "@/features/booking";
import type { BookQuery } from "@/features/booking/book-link";
import type { Locale } from "@/i18n/config";
import type { SiteCity } from "@/lib/content/site-services";

interface CityCardsProps {
  locale: Locale;
  cities: SiteCity[];
  /** Service names by id, listed on each card. */
  serviceNames: Record<string, string>;
  labels: { services: string; book: string };
  preset?: BookQuery;
}

/** One card per operating city, with its services and a booking link; `id` anchors are the city keys. */
export function CityCards({ locale, cities, serviceNames, labels, preset }: CityCardsProps) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cities.map((city) => {
        const services = city.serviceIds.map((id) => serviceNames[id]).filter(Boolean);
        return (
          <li
            key={city.id}
            id={city.cityKey ?? city.slug}
            className="flex scroll-mt-28 flex-col rounded-3xl border border-border bg-card p-6"
          >
            <span className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
              <MapPin aria-hidden="true" className="size-5" />
            </span>
            <h3 className="mt-5 font-display text-2xl font-medium">{city.name}</h3>
            {services.length > 0 && (
              <>
                <p className="mt-4 text-xs font-semibold text-muted-foreground">{labels.services}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {services.map((name) => (
                    <li key={name} className="rounded-full border border-border px-3 py-1 text-xs">
                      {name}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="mt-auto pt-6">
              <BookButton
                locale={locale}
                preset={{ ...preset, ...(city.cityKey && { city: city.cityKey }) }}
                variant="secondary"
                className="w-full"
              >
                {labels.book}
              </BookButton>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
