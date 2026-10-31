import { Briefcase, Check, Users } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { BookButton } from "@/features/booking";
import type { BookQuery } from "@/features/booking/book-link";
import type { Locale } from "@/i18n/config";
import type { SiteVehicle } from "@/lib/content/site-services";
import { isRemoteImage } from "@/lib/remote-image";

interface VehicleClassesProps {
  locale: Locale;
  vehicles: SiteVehicle[];
  labels: { upToPassengers: string; upToLuggage: string; book: string };
  /** Pre-filled on the booking page along with the car, e.g. the page's service. */
  preset?: BookQuery;
  /** "From €X" per vehicle id, when the page has prices to show. */
  prices?: Record<string, ReactNode>;
  showFeatures?: boolean;
}

/** Blacklane's "Discover our service classes": one card per car class, with capacity and a booking link. */
export function VehicleClasses({ locale, vehicles, labels, preset, prices, showFeatures }: VehicleClassesProps) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => (
        <li key={vehicle.id} className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card">
          <div className="relative aspect-[4/3] bg-muted">
            <Image
              src={vehicle.image}
              alt={`${vehicle.name} · ${vehicle.model}`}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
              unoptimized={isRemoteImage(vehicle.image)}
            />
          </div>
          <div className="flex flex-1 flex-col p-6">
            <h3 className="font-display text-2xl font-medium">{vehicle.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{vehicle.model}</p>
            <ul className="mt-5 grid gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Users aria-hidden="true" className="size-4 text-primary" />
                {labels.upToPassengers.replace("{count}", String(vehicle.passengers))}
              </li>
              <li className="flex items-center gap-2">
                <Briefcase aria-hidden="true" className="size-4 text-primary" />
                {labels.upToLuggage.replace("{count}", String(vehicle.luggage))}
              </li>
              {showFeatures &&
                vehicle.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check aria-hidden="true" className="size-4 text-primary" />
                    {feature}
                  </li>
                ))}
            </ul>
            {vehicle.description && showFeatures && (
              <p className="mt-5 text-sm leading-6 text-muted-foreground">{vehicle.description}</p>
            )}
            <div className="mt-auto pt-6">
              {prices?.[vehicle.id]}
              <BookButton
                locale={locale}
                preset={{ ...preset, ...(vehicle.vehicleKey && { vehicle: vehicle.vehicleKey }) }}
                variant="secondary"
                className="mt-4 w-full"
              >
                {labels.book}
              </BookButton>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
