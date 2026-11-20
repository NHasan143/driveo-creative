import { Fragment } from "react";
import { AsteriskIcon } from "@/components/icons/design-icons";
import { CITIES } from "@/domain/booking";
import type { Dictionary } from "@/i18n/get-dictionary";

interface CitiesStripProps {
  label: string;
  cityNames: Dictionary["cities"]["names"];
}

/** "We Are Available In | LONDON * PARIS * BULGARIA * DUBAI", tucked under the hero. */
export function CitiesStrip({ label, cityNames }: CitiesStripProps) {
  return (
    <div className="site-shell flex justify-center">
      <div className="flex w-full flex-col items-center border-b border-[#e8dfd7] md:w-auto md:flex-row md:border-0">
        <p className="p-4 text-center text-xs leading-[1.2] font-medium tracking-[-0.01em] text-muted-text md:flex md:h-[4.25rem] md:items-center md:rounded-es-xl md:border md:border-[#e8dfd7] md:p-6 md:text-base">
          {label}
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 pb-4 md:h-[4.25rem] md:gap-10 md:rounded-ee-xl md:border md:border-s-0 md:border-[#e8dfd7] md:p-6">
          {CITIES.map((city, index) => (
            <Fragment key={city}>
              {index > 0 && (
                <li aria-hidden="true" className="flex">
                  <AsteriskIcon className="h-3 w-[0.6875rem] text-amber md:h-[1.125rem] md:w-4" />
                </li>
              )}
              <li className="font-display text-[0.6875rem] leading-none font-semibold tracking-[-0.01em] text-ink uppercase md:text-lg">
                {cityNames[city]}
              </li>
            </Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}
