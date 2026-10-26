"use client";

import {
  AlertCircle,
  ArrowRight,
  CarFront,
  CheckCircle2,
  MapPin,
  Plus,
  Pencil,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/admin/components/ui/button";
import { Skeleton } from "@/admin/components/ui/primitives";
import { orderDashboardFleet } from "./dashboard-fleet";
import { coverageOf, emptyCoverage, percent } from "@/admin/lib/content/completeness";
import { useCollection } from "@/admin/lib/content/hooks";
import { LOCALE_LABELS, LOCALES } from "@/admin/lib/content/types";
import { formatRelative } from "@/admin/lib/format";
import { cn } from "@/admin/lib/cn";
import styles from "./dashboard.module.css";

function StatCard({ href, icon: Icon, label, value, detail }: { href: string; icon: LucideIcon; label: string; value: ReactNode; detail: string }) {
  return (
    <Link href={href} className={styles.stat}>
      <Icon aria-hidden="true" className={styles.statIcon} />
      <span className={styles.statText}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statDetail}>{detail}</span>
      </span>
    </Link>
  );
}

export function Dashboard() {
  const services = useCollection("services");
  const vehicles = useCollection("vehicles");
  const cities = useCollection("cities");
  const loading = services.isPending || vehicles.isPending || cities.isPending;
  if (loading || !services.data || !vehicles.data || !cities.data) {
    return (
      <>
        <header className={styles.intro}><h1>Dashboard</h1><p>Loading your content…</p></header>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
      </>
    );
  }

  const all = { services: services.data, vehicles: vehicles.data, cities: cities.data };
  const published = <T extends { status: string }>(items: T[]) => items.filter((item) => item.status === "published").length;
  const coverage = coverageOf(all, emptyCoverage());
  const fleet = orderDashboardFleet(all.vehicles);

  // Everything that needs an editor's attention, each with a direct link to the fix.
  const issues: { text: string; href: string }[] = [];
  for (const [items, base, noun] of [
    [all.services, "/admin/services", "Service"],
    [all.vehicles, "/admin/fleet", "Vehicle"],
    [all.cities, "/admin/cities", "City"],
  ] as const) {
    for (const item of items) {
      const name = "title" in item ? item.title.en : item.name.en;
      if (item.status === "draft") issues.push({ text: `${noun} “${name}” is a draft and not on the website`, href: `${base}/${item.id}` });
      const missing = LOCALES.filter((locale) => percent(coverageOf(item)[locale]) < 100);
      if (missing.length)
        issues.push({
          text: `${noun} “${name}” is missing ${missing.map((locale) => LOCALE_LABELS[locale]).join(", ")} text`,
          href: `${base}/${item.id}`,
        });
    }
  }
  for (const service of all.services) {
    if (service.vehicleIds.length === 0) issues.push({ text: `Service “${service.title.en}” has no recommended vehicles`, href: `/admin/services/${service.id}` });
  }
  for (const city of all.cities) {
    if (city.serviceIds.length === 0) issues.push({ text: `City “${city.name.en}” has no services`, href: `/admin/cities/${city.id}` });
  }

  const recent = [
    ...all.services.map((item) => ({ name: item.title.en, href: `/admin/services/${item.id}`, kind: "Service", icon: Sparkles, updatedAt: item.updatedAt })),
    ...all.vehicles.map((item) => ({ name: item.name.en, href: `/admin/fleet/${item.id}`, kind: "Vehicle", icon: CarFront, updatedAt: item.updatedAt })),
    ...all.cities.map((item) => ({ name: item.name.en, href: `/admin/cities/${item.id}`, kind: "City", icon: MapPin, updatedAt: item.updatedAt })),
  ]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  return (
    <div className={styles.dashboard}>
      <header className={styles.intro}>
        <h1>Dashboard</h1>
        <Button asChild size="lg" className={styles.newService}>
          <Link href="/admin/services/new">
            <Plus aria-hidden="true" />
            New service
          </Link>
        </Button>
      </header>

      <div className={styles.stats}>
        <StatCard href="/admin/services" icon={Sparkles} label="Services" value={published(all.services)} detail={`${all.services.length} total · ${all.services.length - published(all.services)} drafts`} />
        <StatCard href="/admin/fleet" icon={CarFront} label="Vehicle classes" value={published(all.vehicles)} detail={`${all.vehicles.length} total`} />
        <StatCard href="/admin/cities" icon={MapPin} label="Cities" value={published(all.cities)} detail={`${all.cities.length} total`} />
      </div>

      <div className={styles.workspace}>
        <div className={styles.workColumn}>
          <section aria-labelledby="fleet-title" className={styles.fleet}>
            <div className={styles.sectionHeading}>
              <h2 id="fleet-title">Fleet</h2>
            </div>
            {fleet.length === 0 ? (
              <p className={styles.clearMessage}>No vehicle classes yet. Use “Add a vehicle class” to create one.</p>
            ) : (
              <ul className={styles.fleetList}>
                {fleet.map((vehicle) => (
                  <li key={vehicle.id} className={styles.fleetRow}>
                    <div className={styles.fleetImage}>
                      {vehicle.image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- admin images can be uploaded data URLs or remote API assets
                        <img src={vehicle.image} alt="" />
                      ) : (
                        <CarFront aria-hidden="true" className="size-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className={styles.fleetDetails}>
                      <h3><Link href={`/admin/fleet/${vehicle.id}`}>{vehicle.name.en || "Untitled vehicle"}</Link></h3>
                      <p>{vehicle.model}</p>
                    </div>
                    <span className={styles.fleetStatus}>
                      <span aria-hidden="true" className={cn(styles.statusDot, vehicle.status === "published" ? "bg-success" : "bg-muted-foreground")} />
                      {vehicle.status === "published" ? "Published" : "Draft"}
                    </span>
                    <Button variant="secondary" asChild className={styles.editButton}>
                      <Link href={`/admin/fleet/${vehicle.id}`} aria-label={`Edit ${vehicle.name.en || "vehicle"}`}>
                        <Pencil aria-hidden="true" />
                        Edit
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="recent-title" className={styles.recent}>
            <div className={styles.sectionHeading}>
              <h2 id="recent-title">Recently updated</h2>
            </div>
            <ul className={styles.recentList}>
              {recent.map(({ name, href, kind, icon: Icon, updatedAt }) => (
                <li key={href}>
                  <Link href={href} className={styles.recentLink}>
                    <span className={styles.recentIcon}>
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className={styles.recentName}>
                      <span>{name}</span>
                      <span>{kind}</span>
                    </span>
                    <span className={styles.timestamp}>{formatRelative(updatedAt)}</span>
                    <ArrowRight aria-hidden="true" className={styles.rowArrow} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className={styles.sideColumn}>
          <section aria-labelledby="actions-title" className={styles.actions}>
            <div className={styles.sectionHeading}>
              <h2 id="actions-title">Quick actions</h2>
            </div>
            <div className={styles.actionList}>
              {[
                { href: "/admin/services/new", label: "Add a service", icon: Sparkles },
                { href: "/admin/fleet/new", label: "Add a vehicle class", icon: CarFront },
                { href: "/admin/cities/new", label: "Add a city", icon: MapPin },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={styles.actionLink}>
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  <span>{label}</span>
                  <ArrowRight aria-hidden="true" className={styles.rowArrow} />
                </Link>
              ))}
            </div>
          </section>

          <section aria-labelledby="attention-title" className={styles.attention}>
            <div className={styles.sectionHeading}>
              <h2 id="attention-title">Needs attention</h2>
              {issues.length > 0 && (
                <span className={styles.issueCount}>{issues.length} {issues.length === 1 ? "item" : "items"} to review</span>
              )}
            </div>
            {issues.length === 0 ? (
              <p className={styles.clearMessage}>
                <CheckCircle2 aria-hidden="true" className="size-5 shrink-0 text-success" />
                Everything is published and fully translated.
              </p>
            ) : (
              <ul className={styles.issueList}>
                {issues.slice(0, 8).map((issue) => (
                  <li key={issue.text}>
                    <Link href={issue.href} className={styles.issueLink}>
                      <AlertCircle aria-hidden="true" className="size-4 shrink-0 text-warning" />
                      <span>{issue.text}</span>
                      <ArrowRight aria-hidden="true" className={styles.rowArrow} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="translations-title" className={styles.translations}>
            <div className={styles.sectionHeading}>
              <h2 id="translations-title">Translations</h2>
              <p>Editable content, per language.</p>
            </div>
            <div className={styles.languageList}>
              {LOCALES.map((locale) => {
                const done = percent(coverage[locale]);
                return (
                  <div key={locale} className={styles.language}>
                    <div className={styles.languageLabel}>
                      <span lang={locale}>{LOCALE_LABELS[locale]}</span>
                      <span>{done}%</span>
                    </div>
                    <div
                      className={styles.progress}
                      role="progressbar"
                      aria-label={`${LOCALE_LABELS[locale]} translation coverage`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={done}
                    >
                      <div className={cn(styles.progressFill, done === 100 ? "bg-success" : "bg-warning")} style={{ width: `${done}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
