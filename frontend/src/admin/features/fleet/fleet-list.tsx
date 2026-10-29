"use client";

import { CarFront, Luggage, Users } from "lucide-react";
import { CollectionList } from "@/admin/components/content/collection-list";
import { useCollection } from "@/admin/lib/content/hooks";
import { duplicateVehicle } from "./vehicle-schema";

export function FleetList() {
  const { data: services = [] } = useCollection("services");

  return (
    <CollectionList
      collection="vehicles"
      noun="vehicle"
      basePath="/admin/fleet"
      emptyIcon={<CarFront />}
      emptyDescription="Vehicle classes appear on the Fleet page, on service pages and in the booking form."
      searchText={(vehicle) => `${vehicle.name.en} ${vehicle.model} ${vehicle.slug}`}
      displayName={(vehicle) => vehicle.name.en || "Untitled vehicle"}
      duplicate={duplicateVehicle}
      renderPrimary={(vehicle) => (
        <span className="flex min-w-0 items-center gap-3">
          <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
            {vehicle.image && (
              // eslint-disable-next-line @next/next/no-img-element -- may be a local data URL
              <img src={vehicle.image} alt="" className="size-full object-cover" />
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-foreground group-hover:text-primary">
              {vehicle.name.en || "Untitled vehicle"}
            </span>
            <span className="block truncate text-xs text-muted-foreground">{vehicle.model}</span>
          </span>
        </span>
      )}
      extraColumn={{
        label: "Capacity",
        render: (vehicle) => (
          <span className="inline-flex items-center gap-3 whitespace-nowrap tabular-nums">
            <span className="inline-flex items-center gap-1" title="Passengers">
              <Users aria-hidden="true" className="size-3.5" />
              {vehicle.passengers}
              <span className="sr-only">passengers</span>
            </span>
            <span className="inline-flex items-center gap-1" title="Luggage">
              <Luggage aria-hidden="true" className="size-3.5" />
              {vehicle.luggage}
              <span className="sr-only">luggage items</span>
            </span>
          </span>
        ),
      }}
      deleteWarning={(vehicle) => {
        const usedBy = services.filter((service) => service.vehicleIds.includes(vehicle.id));
        return usedBy.length ? (
          <p className="mt-2">It will also be removed from {usedBy.map((service) => service.title.en).join(", ")}.</p>
        ) : null;
      }}
    />
  );
}
