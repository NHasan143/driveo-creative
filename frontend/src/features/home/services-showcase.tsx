import Image from "next/image";
import Link from "next/link";
import { ArrowRightSmallIcon } from "@/components/icons/design-icons";
import { SectionIntro } from "@/components/site/section-intro";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";

const IMAGES = ["/media/site/home/service-airport.jpg", "/media/site/home/service-hourly.jpg", "/media/site/home/service-business.jpg"];

interface ServicesShowcaseProps {
  copy: Dictionary["site"]["home"]["services"];
  /** Where each card leads, in the order of `copy.items`. */
  hrefs: string[];
}

/** "Our service": three numbered photo cards, the middle one set lower, as in the design. */
export function ServicesShowcase({ copy, hrefs }: ServicesShowcaseProps) {
  return (
    <section className="section-band bg-cream xl:pb-[4.375rem]">
      <div className="site-shell flex flex-col gap-7 xl:gap-14">
        <SectionIntro badge={copy.badge} lead={copy.lead} accent={copy.accent} />
        <ol className="grid gap-10 md:grid-cols-3 md:gap-6">
          {copy.items.map((item, index) => (
            <li key={item.title} className={cn("relative pt-10 xl:pt-[3.9375rem]", index === 1 && "md:mt-24")}>
              <span
                aria-hidden="true"
                className="absolute end-0 top-0 text-[3.25rem] leading-[1.2] font-extrabold tracking-[-0.03em] text-[#dac7b7] opacity-80 xl:end-3 xl:text-[5rem]"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <Link href={hrefs[index] ?? "#"} className="group relative flex flex-col gap-4">
                <div className="relative aspect-[350/298] overflow-hidden rounded-xl bg-white xl:aspect-[424/373]">
                  <Image
                    src={IMAGES[index % IMAGES.length]}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_6%,rgba(0,0,0,0)_54%,rgba(0,0,0,0.25)_100%)]"
                  />
                </div>
                <div className="flex flex-col gap-2 pe-3">
                  <p className="text-xs leading-[1.2] font-medium tracking-[-0.03em] text-amber-text xl:text-[0.9375rem]">{item.label}</p>
                  <h3 className="flex items-center gap-3 font-display text-xl leading-[1.2] font-semibold tracking-[-0.015em] text-ink xl:text-2xl">
                    <span>{item.title}</span>
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-amber-text text-white transition-transform group-hover:translate-x-0.5 xl:size-8 rtl:group-hover:-translate-x-0.5">
                      <ArrowRightSmallIcon className="size-4 rtl:-scale-x-100" />
                    </span>
                  </h3>
                  <p className="text-sm leading-[1.6] tracking-[-0.01em] text-muted-text xl:text-[0.9375rem]">{item.copy}</p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
