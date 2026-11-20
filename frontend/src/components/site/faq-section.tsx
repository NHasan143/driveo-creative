"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import { CaretDownIcon } from "@/components/icons/design-icons";
import { ANCHORS } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { SectionIntro } from "./section-intro";

export interface FaqEntry {
  q: string;
  a: string;
}

interface FaqSectionProps {
  badge: string;
  lead: string;
  accent: string;
  clarityTitle: string;
  clarityBody: string;
  contactLabel: string;
  contactHref: string;
  items: FaqEntry[];
  className?: string;
}

const FACES = [
  "/media/site/people/faq-1.jpg",
  "/media/site/people/faq-2.jpg",
  "/media/site/people/faq-3.jpg",
  "/media/site/people/faq-4.jpg",
];

/** FAQ accordion with the "Need more clarity?" card beside it. The second question starts open, as designed. */
export function FaqSection({ badge, lead, accent, clarityTitle, clarityBody, contactLabel, contactHref, items, className }: FaqSectionProps) {
  const [open, setOpen] = useState<number | null>(items.length > 1 ? 1 : 0);
  const baseId = useId();

  return (
    <section id={ANCHORS.faq} className={cn("section-band scroll-mt-24 bg-white", className)}>
      <div className="site-shell flex flex-col gap-7 xl:gap-12">
        <SectionIntro badge={badge} lead={lead} accent={accent} className="gap-3" />

        <div className="flex flex-col-reverse gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-[21.125rem] flex-col items-start gap-4">
            <div className="flex items-center" aria-hidden="true">
              {FACES.map((src) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  width={52}
                  height={52}
                  className="-me-4 size-[3.25rem] rounded-full border-[1.4px] border-white object-cover object-top last:me-0"
                />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-xl leading-[1.2] font-semibold tracking-[-0.01em] text-ink-soft">{clarityTitle}</h3>
              <p className="text-[0.9375rem] leading-[1.6] tracking-[-0.01em] text-muted-text">{clarityBody}</p>
            </div>
            <Link
              href={contactHref}
              className="inline-flex min-h-11 items-center rounded-full bg-ink-soft px-8 text-[0.9375rem] leading-[1.2] font-medium tracking-[-0.03em] text-white transition-colors hover:bg-[#2a251e]"
            >
              {contactLabel}
            </Link>
          </div>

          <ul className="w-full lg:max-w-[42.5625rem]">
            {items.map((item, index) => {
              const expanded = open === index;
              const buttonId = `${baseId}-q${index}`;
              const panelId = `${baseId}-a${index}`;
              return (
                <li key={item.q} className="border-b border-line">
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={() => setOpen(expanded ? null : index)}
                      className="flex w-full items-center justify-between gap-6 py-4 text-start"
                    >
                      <span
                        className={cn(
                          "text-base leading-[1.5] font-medium tracking-[-0.01em] xl:text-lg",
                          expanded ? "text-ink" : "text-body",
                        )}
                      >
                        {item.q}
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-full border transition-colors",
                          expanded ? "border-ink bg-ink text-white" : "border-line-warm text-ink",
                        )}
                      >
                        <CaretDownIcon className={cn("size-4 transition-transform duration-200", expanded && "rotate-180")} />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    hidden={!expanded}
                    className="-mt-1 max-w-[30.1875rem] pb-4 text-[0.9375rem] leading-[1.6] tracking-[-0.01em] text-muted-text"
                  >
                    {item.a}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
