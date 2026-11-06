import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingFlow, type FlowVehicle } from "@/features/booking/components/booking-flow";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getServicePrices, getSiteFleet } from "@/lib/content/site-services";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { bookFlow } = await getDictionary(locale);
  // A step in a booking, not a page to land on from search.
  return { ...buildPageMetadata(locale, bookFlow.meta, "/book"), robots: { index: false, follow: true } };
}

function FlowSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]" aria-hidden="true">
      <div className="grid gap-6">
        <div className="h-10 rounded-full bg-muted" />
        <div className="h-80 rounded-3xl bg-card" />
        <div className="h-48 rounded-3xl bg-card" />
      </div>
      <div className="h-64 rounded-3xl bg-card" />
    </div>
  );
}

/** /book?lang=…&service=…&city=…: the steps after "See prices" in the booking bar. */
export default async function BookPage() {
  const locale = await getLocale();
  const [t, prices, fleet] = await Promise.all([getDictionary(locale), getServicePrices(), getSiteFleet(locale)]);
  const vehicles: FlowVehicle[] = fleet.flatMap((vehicle) =>
    vehicle.vehicleKey ? [{ key: vehicle.vehicleKey, name: vehicle.name, model: vehicle.model, image: vehicle.image }] : [],
  );

  return (
    <main className="min-h-screen bg-background pt-[calc(var(--header-height)+2.5rem)] pb-24 text-foreground">
      <div className="site-shell">
        <h1 className="font-display text-[clamp(2.2rem,4.5vw,3.6rem)] leading-tight font-medium">{t.bookFlow.title}</h1>
        <div className="mt-8">
          {/* The choices arrive in the query string, which is only known in the browser. */}
          <Suspense fallback={<FlowSkeleton />}>
            <BookingFlow
              locale={locale}
              labels={{
                flow: t.bookFlow,
                booking: t.booking,
                bar: t.bookingBar,
                pricing: t.pricing,
                cityNames: t.cities.names,
              }}
              prices={prices}
              vehicles={vehicles}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
