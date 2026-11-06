"use client";

import { MapPin } from "lucide-react";
import { CollectionList } from "@/admin/components/content/collection-list";
import { useCollection } from "@/admin/lib/content/hooks";
import { duplicateCity } from "./city-schema";

export function CitiesList() {
  const { data: services = [] } = useCollection("services");
  const serviceCount = services.length;

  return (
    <CollectionList
      collection="cities"
      noun="city"
      basePath="/admin/cities"
      emptyIcon={<MapPin />}
      emptyDescription="Cities appear on the website's Cities page, in the footer and in the booking form."
      searchText={(city) => `${city.name.en} ${city.slug}`}
      displayName={(city) => city.name.en || "Untitled city"}
      duplicate={duplicateCity}
      renderPrimary={(city) => (
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
            <MapPin aria-hidden="true" className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-foreground group-hover:text-primary">
              {city.name.en || "Untitled city"}
            </span>
            <span className="block truncate text-xs text-muted-foreground" lang="bg">
              {[city.name.fr, city.name.bg, city.name.ar].filter(Boolean).join(" · ")}
            </span>
          </span>
        </span>
      )}
      extraColumn={{
        label: "Services",
        render: (city) => (
          <span className="tabular-nums">
            {city.serviceIds.length === serviceCount && serviceCount > 0 ? "All" : city.serviceIds.length} of {serviceCount}
          </span>
        ),
      }}
    />
  );
}
