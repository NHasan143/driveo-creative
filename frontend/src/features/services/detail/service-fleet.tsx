import { Luggage, Users } from "lucide-react";
import { ParallaxSurface } from "@/components/motion/parallax-surface";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/page/section-heading";
import { ArrowLink } from "@/components/ui/arrow-link";
import { getVehicleCapacity, type FleetVehicle } from "@/domain/booking";
import { FleetFrame } from "@/features/fleet/fleet-frame";
import { fleetMedia } from "@/features/fleet/fleet-media";
import fleetStyles from "@/features/fleet/fleet-section.module.css";
import { RequestQuoteButton, type QuotePreset } from "@/features/quote";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

interface ServiceFleetProps {
  locale: Locale;
  /** Pre-fill for this service's quote buttons (empty for services the booking rules don't know). */
  preset: Partial<QuotePreset>;
  vehicles: readonly FleetVehicle[];
  heading: { eyebrow: string; title: string; more: string };
  fleet: Dictionary["fleet"];
  capacity: { passengers: string; luggage: string; upTo: string };
}

/** The fleet in the order that suits this service, each pre-filling service and vehicle. */
export function ServiceFleet({ locale, preset, vehicles, heading, fleet, capacity }: ServiceFleetProps) {
  return (
    <section className="section-band bg-background">
      <div className="site-shell">
        <SectionHeading
          eyebrow={heading.eyebrow}
          title={heading.title}
          action={<ArrowLink href={localePath(locale, "/fleet")}>{heading.more}</ArrowLink>}
        />

        <Reveal stagger className={fleetStyles.grid}>
          {vehicles.map((vehicle, index) => {
            const limits = getVehicleCapacity(vehicle);
            return (
              <ParallaxSurface as="article" key={vehicle} className={fleetStyles.card}>
                <FleetFrame
                  vehicle={vehicle}
                  altSuffix={fleet.imageSuffix}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  driftOffset={index}
                />
                <p className="mono-label mt-5">{fleetMedia[vehicle].model}</p>
                <h3 className="card-title mt-2">{fleet.items[vehicle].title}</h3>
                <ul className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
                    <Users aria-hidden="true" className="size-3.5 text-primary" />
                    {capacity.passengers}: {capacity.upTo} {limits.passengers}
                  </li>
                  <li className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
                    <Luggage aria-hidden="true" className="size-3.5 text-primary" />
                    {capacity.luggage}: {capacity.upTo} {limits.luggage}
                  </li>
                </ul>
                <RequestQuoteButton preset={{ ...preset, vehicle }} className={fleetStyles.button}>
                  {fleet.button}
                </RequestQuoteButton>
              </ParallaxSurface>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
