import { Luggage, Users } from "lucide-react";
import { ParallaxSurface } from "@/components/motion/parallax-surface";
import { Reveal } from "@/components/motion/reveal";
import { CheckList } from "@/components/ui/check-list";
import { FLEET_VEHICLES, getVehicleCapacity } from "@/domain/booking";
import { RequestQuoteButton } from "@/features/quote";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { FleetFrame } from "./fleet-frame";
import { fleetMedia } from "./fleet-media";
import styles from "./fleet-section.module.css";

interface FleetShowcaseProps {
  fleet: Dictionary["fleet"];
  page: Dictionary["pages"]["fleet"];
}

/** Large alternating rows: photo on one side, class details and capacity on the other. */
export function FleetShowcase({ fleet, page }: FleetShowcaseProps) {
  return (
    <section className="section-band bg-background">
      <div className="site-shell grid gap-24 lg:gap-32">
        {FLEET_VEHICLES.map((vehicle, index) => {
          const item = fleet.items[vehicle];
          const capacity = getVehicleCapacity(vehicle);
          const flipped = index % 2 === 1;

          return (
            <Reveal key={vehicle} id={vehicle} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
              <ParallaxSurface as="article" className={cn(styles.card, flipped && "lg:order-2")}>
                <FleetFrame
                  vehicle={vehicle}
                  altSuffix={fleet.imageSuffix}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  driftOffset={index}
                />
              </ParallaxSurface>

              <div>
                <p className="mono-label">
                  {String(index + 1).padStart(2, "0")} · {fleetMedia[vehicle].model}
                </p>
                <h2 className="section-title">{item.title}</h2>
                <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">{item.copy}</p>

                <dl className="mt-8 flex flex-wrap gap-3">
                  {[
                    { Icon: Users, label: page.passengers, value: capacity.passengers },
                    { Icon: Luggage, label: page.luggage, value: capacity.luggage },
                  ].map(({ Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 rounded-full border border-primary/40 px-4 py-2"
                    >
                      <Icon aria-hidden="true" className="size-4 text-primary" />
                      <dt className="mono-label">{label}</dt>
                      <dd className="font-mono text-sm font-bold">
                        {page.upTo} {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mono-label mt-8 mb-4">{page.featuresLabel}</p>
                <CheckList items={page.features[vehicle]} className="sm:grid-cols-2 sm:gap-x-8" />

                <RequestQuoteButton preset={{ vehicle }} className="mt-9">
                  {fleet.button}
                </RequestQuoteButton>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
