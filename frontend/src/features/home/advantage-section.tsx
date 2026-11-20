import Image from "next/image";
import { SectionIntro } from "@/components/site/section-intro";
import type { Dictionary } from "@/i18n/get-dictionary";

type Item = Dictionary["site"]["home"]["advantage"]["items"][number];

function Advantage({ item, index }: { item: Item; index: number }) {
  return (
    <div className="flex gap-6 xl:flex-col xl:gap-[2.5625rem]">
      <p className="w-6 shrink-0 pt-1 text-sm leading-[1.2] font-semibold tracking-[-0.03em] text-amber-bright xl:w-auto xl:pt-0 xl:text-xl">
        {String(index + 1).padStart(2, "0")}
      </p>
      <div className="flex flex-col gap-2 xl:gap-3.5">
        <h3 className="font-display text-xl leading-[1.2] font-medium tracking-[-0.015em] text-white xl:text-2xl">{item.title}</h3>
        <p className="text-sm leading-[1.6] tracking-[-0.01em] text-sand xl:text-[0.9375rem]">{item.copy}</p>
      </div>
    </div>
  );
}

/** "Our advantage": dark band, a photograph and four numbered promises between dotted rules. */
export function AdvantageSection({ copy }: { copy: Dictionary["site"]["home"]["advantage"] }) {
  const [first, second, third, fourth] = copy.items;

  return (
    <section className="section-band bg-ink">
      <div className="site-shell flex flex-col gap-7 xl:gap-0">
        <SectionIntro badge={copy.badge} lead={copy.lead} accent={copy.accent} tone="dark" className="xl:ps-5" />

        <div className="flex flex-col gap-8 xl:mt-[3.75rem] xl:flex-row xl:items-center xl:justify-between">
          <div className="relative aspect-[350/255] overflow-hidden rounded-xl xl:aspect-[418/460] xl:w-[26.125rem] xl:shrink-0">
            <Image src="/media/site/home/advantage.jpg" alt={copy.imageAlt} fill sizes="(min-width: 1280px) 418px, 100vw" className="object-cover" />
          </div>

          {/* Phones: one list with dotted separators. */}
          <ol className="flex flex-col xl:hidden">
            {copy.items.map((item, index) => (
              <li key={item.title} className="py-5 first:pt-0">
                <Advantage item={item} index={index} />
                {index < copy.items.length - 1 && <div aria-hidden="true" className="rule-dotted-x mt-5" />}
              </li>
            ))}
          </ol>

          {/* Desktop: two staggered columns between vertical dotted rules. */}
          <div className="hidden h-[48.9375rem] w-[50.25rem] gap-[2.6875rem] xl:flex">
            <div aria-hidden="true" className="rule-dotted-y h-full" />
            <ol className="flex w-[20.8125rem] flex-col gap-[7.5rem]">
              <li>{first && <Advantage item={first} index={0} />}</li>
              <li aria-hidden="true" className="rule-dotted-x" />
              <li>{second && <Advantage item={second} index={1} />}</li>
            </ol>
            <div aria-hidden="true" className="rule-dotted-y h-full" />
            <ol start={3} className="flex w-[20.8125rem] flex-col justify-end gap-20 pb-[7.5rem]">
              <li>{third && <Advantage item={third} index={2} />}</li>
              <li aria-hidden="true" className="rule-dotted-x" />
              <li>{fourth && <Advantage item={fourth} index={3} />}</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
