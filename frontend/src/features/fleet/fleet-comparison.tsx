import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/page/section-heading";
import { FLEET_VEHICLES, getVehicleCapacity } from "@/domain/booking";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { SiteVehicle } from "@/lib/content/site-services";
import { fleetMedia } from "./fleet-media";

interface FleetComparisonProps {
  fleet: Dictionary["fleet"];
  page: Dictionary["pages"]["fleet"];
  vehicles?: SiteVehicle[];
}

/** Side-by-side capacity table for the vehicle classes. */
export function FleetComparison({ fleet, page, vehicles }: FleetComparisonProps) {
  const columns = [page.compareClass, page.compareVehicle, page.passengers, page.luggage];

  return (
    <section className="section-band bg-secondary">
      <div className="site-shell">
        <SectionHeading eyebrow={page.compareEyebrow} title={page.compareTitle} />

        <Reveal className="mt-12 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[36rem] border-collapse text-start">
            <thead>
              <tr className="border-b border-border bg-background/60">
                {columns.map((column) => (
                  <th key={column} scope="col" className="mono-label px-6 py-4 text-start font-normal">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles && vehicles.length > 0
                ? vehicles.map((v) => {
                    const title = v.name || (v.vehicleKey ? fleet.items[v.vehicleKey]?.title : v.id);
                    const model = v.model || (v.vehicleKey ? fleetMedia[v.vehicleKey]?.model : "");
                    return (
                      <tr
                        key={v.id}
                        className="border-b border-border transition-colors last:border-b-0 hover:bg-background/40"
                      >
                        <th scope="row" className="px-6 py-5 text-start font-display text-xl font-medium">
                          {title}
                        </th>
                        <td className="px-6 py-5 text-sm text-muted-foreground">{model}</td>
                        <td className="px-6 py-5 font-mono text-sm">
                          {page.upTo} {v.passengers}
                        </td>
                        <td className="px-6 py-5 font-mono text-sm">
                          {page.upTo} {v.luggage}
                        </td>
                      </tr>
                    );
                  })
                : FLEET_VEHICLES.map((vehicle) => {
                    const capacity = getVehicleCapacity(vehicle);
                    return (
                      <tr
                        key={vehicle}
                        className="border-b border-border transition-colors last:border-b-0 hover:bg-background/40"
                      >
                        <th scope="row" className="px-6 py-5 text-start font-display text-xl font-medium">
                          {fleet.items[vehicle].title}
                        </th>
                        <td className="px-6 py-5 text-sm text-muted-foreground">{fleetMedia[vehicle].model}</td>
                        <td className="px-6 py-5 font-mono text-sm">
                          {page.upTo} {capacity.passengers}
                        </td>
                        <td className="px-6 py-5 font-mono text-sm">
                          {page.upTo} {capacity.luggage}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}
