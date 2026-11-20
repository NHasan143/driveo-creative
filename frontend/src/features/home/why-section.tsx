import Image from "next/image";
import { SectionIntro } from "@/components/site/section-intro";
import { ANCHORS } from "@/config/navigation";
import type { Dictionary } from "@/i18n/get-dictionary";

const IMAGES = ["/media/site/home/why-worldwide.jpg", "/media/site/home/why-vehicles.jpg", "/media/site/home/why-safe.jpg"];

/** "Why choose us": three photo cards. Also the target of the header's "About" link. */
export function WhySection({ copy }: { copy: Dictionary["site"]["home"]["why"] }) {
  return (
    <section id={ANCHORS.about} className="section-band scroll-mt-20 bg-white">
      <div className="site-shell flex flex-col gap-7 xl:gap-12">
        <SectionIntro badge={copy.badge} lead={copy.lead} accent={copy.accent} />
        <ul className="grid gap-6 md:grid-cols-3 xl:gap-[1.5625rem]">
          {copy.items.map((item, index) => (
            <li key={item.title} className="flex flex-col gap-3 xl:gap-4">
              <div className="relative aspect-[350/237] overflow-hidden rounded-[1.25rem] md:aspect-[424/431]">
                <Image
                  src={IMAGES[index % IMAGES.length]}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-base leading-[1.2] font-semibold tracking-[-0.01em] text-ink xl:text-lg">{item.title}</h3>
                <p className="text-sm leading-[1.5] tracking-[-0.01em] text-muted-text xl:max-w-[23.5rem] xl:text-[0.9375rem]">{item.copy}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
