"use client";

import { Sparkles } from "lucide-react";
import { CollectionList } from "@/admin/components/content/collection-list";
import { useCollection } from "@/admin/lib/content/hooks";
import { SERVICE_ICON_COMPONENTS } from "./service-icons";
import { duplicateService } from "./service-schema";

export function ServicesList() {
  const { data: cities = [] } = useCollection("cities");

  return (
    <CollectionList
      collection="services"
      noun="service"
      basePath="/admin/services"
      emptyIcon={<Sparkles />}
      emptyDescription="Services appear on the website's Services page, menu and booking form."
      searchText={(service) => `${service.title.en} ${service.label.en} ${service.slug}`}
      displayName={(service) => service.title.en || "Untitled service"}
      duplicate={duplicateService}
      renderPrimary={(service) => {
        const { Icon } = SERVICE_ICON_COMPONENTS[service.icon];
        return (
          <span className="flex min-w-0 items-center gap-3">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
              {service.heroImage && (
                // eslint-disable-next-line @next/next/no-img-element -- may be a local data URL
                <img src={service.heroImage} alt="" className="size-full object-cover" />
              )}
              <span className="absolute end-0.5 bottom-0.5 grid size-5 place-items-center rounded-md bg-surface text-primary shadow-card">
                <Icon aria-hidden="true" className="size-3" />
              </span>
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold text-foreground group-hover:text-primary">
                {service.title.en || "Untitled service"}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {service.label.en} · /services/{service.slug}
              </span>
            </span>
          </span>
        );
      }}
      deleteWarning={(service) => {
        const usedIn = cities.filter((city) => city.serviceIds.includes(service.id));
        return usedIn.length ? (
          <p className="mt-2">
            It will also be removed from {usedIn.map((city) => city.name.en).join(", ")}.
          </p>
        ) : null;
      }}
    />
  );
}
