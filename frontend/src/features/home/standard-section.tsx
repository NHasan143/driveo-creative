import { CarFront, MapPin, ShieldCheck } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";

interface StandardSectionProps {
  title: string;
  intro: string;
  cities: Dictionary["cities"];
  fleet: { title: string; copy: string };
  chauffeurs: { title: string; copy: string };
}

/** A light band: the house standard in three columns, all from facts stated elsewhere on the site. */
export function StandardSection({ title, intro, cities, fleet, chauffeurs }: StandardSectionProps) {
  const items = [
    { Icon: MapPin, title: cities.titleLine1, copy: cities.copy },
    { Icon: CarFront, title: fleet.title, copy: fleet.copy },
    { Icon: ShieldCheck, title: chauffeurs.title, copy: chauffeurs.copy },
  ];

  return (
    <section className="bg-foreground py-24 text-background sm:py-32">
      <div className="site-shell text-center">
        <h2 className="mx-auto max-w-3xl font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.05] font-medium text-balance">
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-background/70">{intro}</p>

        <ul className="mt-16 grid gap-12 text-start sm:grid-cols-3 sm:text-center">
          {items.map(({ Icon, title: itemTitle, copy }) => (
            <li key={itemTitle} className="flex flex-col sm:items-center">
              <span className="grid size-14 place-items-center rounded-full border border-background/20">
                <Icon aria-hidden="true" className="size-6" strokeWidth={1.5} />
              </span>
              <p className="mt-5 font-display text-2xl font-medium">{itemTitle}</p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-background/70">{copy}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
