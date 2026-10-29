import { BrandMark } from "@/components/brand/brand-mark";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary";
import { getServicePrices } from "@/lib/content/site-services";
import { BOOKING_SECTION_ID } from "../booking-preset-context";
import { BookingForm } from "./booking-form";
import styles from "./booking-section.module.css";

interface BookingSectionProps {
  locale: Locale;
  booking: Dictionary["booking"];
  cityNames: Dictionary["cities"]["names"];
}

export async function BookingSection({ locale, booking, cityNames }: BookingSectionProps) {
  const [{ pricing }, prices] = await Promise.all([getDictionary(locale), getServicePrices()]);

  return (
    <section id={BOOKING_SECTION_ID} className={styles.band}>
      <div className={styles.orbit} aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      <div className={`site-shell ${styles.layout}`}>
        <Reveal className={styles.intro}>
          <Eyebrow>{booking.eyebrow}</Eyebrow>
          <h2>{booking.title}</h2>
          <p className={styles.lead}>{booking.intro}</p>
          <div className={styles.seal}>
            <BrandMark />
            <span>
              {booking.seal.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </span>
          </div>
        </Reveal>

        <Reveal y={56}>
          <BookingForm
            locale={locale}
            labels={booking}
            cityNames={cityNames}
            pricing={pricing}
            prices={prices}
          />
        </Reveal>
      </div>
    </section>
  );
}
