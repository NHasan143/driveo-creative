import { Reveal } from "@/components/motion/reveal";
import { siteConfig } from "@/config/site";
import { CITIES, SERVICE_TYPES } from "@/domain/booking";
import { BookButton } from "@/features/booking";
import type { Dictionary } from "@/i18n/get-dictionary";

interface CityDirectoryProps {
  cityNames: Dictionary["cities"]["names"];
  serviceNames: Dictionary["booking"]["serviceOptions"];
  page: Dictionary["pages"]["cities"];
}

/** One large panel per city, each with the services offered and a pre-filled booking action. */
export function CityDirectory({ cityNames, serviceNames, page }: CityDirectoryProps) {
  return (
    <section className="section-band bg-background">
      <div className="site-shell">
        <Reveal
          stagger
          className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2"
        >
          {CITIES.map((city, index) => (
            <article
              key={city}
              id={city}
              className="group relative flex min-h-[26rem] scroll-mt-28 flex-col overflow-hidden bg-background p-8 transition-colors duration-300 hover:bg-secondary sm:p-10"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -end-2 -top-6 font-display text-[9rem] leading-none text-primary/10 transition-colors duration-500 group-hover:text-primary/20"
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <p className="mono-label">
                {String(index + 1).padStart(2, "0")} · {siteConfig.shortName}
              </p>
              <h2 className="mt-4 font-display text-[clamp(2.6rem,5vw,4rem)] leading-none font-medium">
                {cityNames[city]}
              </h2>

              <p className="mono-label mt-10 mb-4">{page.servicesLabel}</p>
              <ul className="flex flex-wrap gap-2">
                {SERVICE_TYPES.map((service) => (
                  <li
                    key={service}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    {serviceNames[service]}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-10">
                <BookButton preset={{ city }}>{page.bookCta}</BookButton>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
