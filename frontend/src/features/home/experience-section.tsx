import Image from "next/image";
import { SectionIntro } from "@/components/site/section-intro";
import type { Dictionary } from "@/i18n/get-dictionary";

const IMAGES = [
  "/media/site/home/experience-welcome.jpg",
  "/media/site/home/experience-start.jpg",
  "/media/site/home/experience-detail.jpg",
];

/**
 * "The experience": three wide photographs with a frosted caption at the foot.
 * On large screens the cards pin under the header and stack as you scroll.
 */
export function ExperienceSection({ copy }: { copy: Dictionary["site"]["home"]["experience"] }) {
  return (
    <section className="section-band bg-white xl:pb-[4.375rem]">
      <div className="site-shell flex flex-col gap-7 xl:gap-14">
        <SectionIntro badge={copy.badge} lead={copy.lead} accent={copy.accent} />
        <ol className="flex flex-col gap-5 xl:w-[calc(100%-2.4375rem)] xl:gap-8">
          {copy.items.map((item, index) => (
            <li
              key={item.title}
              className="overflow-hidden rounded-[1.25rem] bg-ink xl:sticky xl:top-[calc(var(--header-height)+1.5rem)] xl:h-[43.5rem] xl:bg-[#c4c4c4]"
              style={{ zIndex: index + 1 }}
            >
              <div className="relative h-full">
                <div className="relative aspect-[350/176] overflow-hidden xl:absolute xl:inset-0 xl:aspect-auto">
                  <Image
                    src={IMAGES[index % IMAGES.length]}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1280px) 1280px, 100vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_30%,rgba(0,0,0,0)_57%,rgba(0,0,0,0.6)_88%)] xl:block"
                  />
                </div>

                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-[66.95%] hidden h-px bg-[linear-gradient(90deg,transparent_14%,rgba(204,204,204,0.6)_50%,transparent_85%)] xl:block"
                />

                <div className="relative xl:absolute xl:bottom-0 xl:left-1/2 xl:w-[26.5625rem] xl:-translate-x-1/2">
                  <div
                    aria-hidden="true"
                    className="absolute top-[-10%] left-1/2 hidden h-48 w-64 -translate-x-1/2 rotate-[30deg] rounded-full bg-[#be870e] opacity-70 blur-[40px] xl:block"
                  />
                  <div className="relative flex flex-col items-center gap-3 bg-[linear-gradient(180deg,rgba(74,60,40,0.85),rgba(25,22,18,0.95))] px-6 py-6 text-center xl:h-[14.375rem] xl:justify-center xl:gap-4 xl:border-x xl:border-[rgba(204,204,204,0.5)] xl:bg-none xl:bg-[rgba(25,22,18,0.6)] xl:p-8 xl:backdrop-blur-[17.5px]">
                    <h3 className="font-baskerville text-lg leading-[1.2] font-semibold tracking-[-0.03em] text-white xl:text-[1.75rem]">
                      {item.title}
                    </h3>
                    <p className="max-w-[22.625rem] text-xs leading-[1.6] tracking-[-0.01em] text-[#e0e0e0] xl:text-[0.9375rem]">{item.copy}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
