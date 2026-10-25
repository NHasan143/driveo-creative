"use client";

import {
  AlertCircle,
  ArrowRight,
  CarFront,
  CheckCircle2,
  Languages,
  MapPin,
  MessageSquareQuote,
  Plus,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { PageHeader } from "@/admin/components/layout/page-header";
import { Button } from "@/admin/components/ui/button";
import { Card, CardBody, CardHeader, Skeleton } from "@/admin/components/ui/primitives";
import { IS_LOCAL_DEMO } from "@/admin/lib/content";
import { coverageOf, emptyCoverage, percent } from "@/admin/lib/content/completeness";
import { useCollection, useSettings } from "@/admin/lib/content/hooks";
import { LOCALE_LABELS, LOCALES } from "@/admin/lib/content/types";
import { formatRelative } from "@/admin/lib/format";
import { cn } from "@/admin/lib/cn";

function StatCard({ href, icon: Icon, label, value, detail }: { href: string; icon: LucideIcon; label: string; value: ReactNode; detail: string }) {
  return (
    <Link href={href} className="group">
      <Card className="h-full p-4 transition-colors group-hover:border-primary/40 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-muted-foreground">{label}</span>
          <span className="hidden size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary sm:grid">
            <Icon aria-hidden="true" className="size-4" />
          </span>
        </div>
        <p className="mt-2 font-display text-3xl font-medium tabular-nums sm:mt-3">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </Card>
    </Link>
  );
}

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Dashboard() {
  const services = useCollection("services");
  const vehicles = useCollection("vehicles");
  const cities = useCollection("cities");
  const settings = useSettings();
  const [hello, setHello] = useState("Welcome back");

  // The visitor's clock, not the server's.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setHello(greeting(new Date().getHours())), []);

  const loading = services.isPending || vehicles.isPending || cities.isPending || settings.isPending;
  if (loading || !services.data || !vehicles.data || !cities.data || !settings.data) {
    return (
      <>
        <PageHeader title={hello} description="Loading your content…" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
      </>
    );
  }

  const all = { services: services.data, vehicles: vehicles.data, cities: cities.data, settings: settings.data };
  const published = <T extends { status: string }>(items: T[]) => items.filter((item) => item.status === "published").length;
  const coverage = coverageOf(all, emptyCoverage());
  const liveTestimonials = all.settings.testimonials.filter((testimonial) => testimonial.published).length;

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
    { name: "Site settings", href: "/admin/settings", kind: "Settings", icon: Settings, updatedAt: all.settings.updatedAt },
  ]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  return (
    <>
      <PageHeader
        title={hello}
        description={
          IS_LOCAL_DEMO
            ? "Here's the state of the Driveo website content. In demo mode, changes stay in this browser."
            : "Here's the state of the Driveo website content. Changes you publish here go to the live site."
        }
        actions={
          <Button asChild>
            <Link href="/admin/services/new">
              <Plus aria-hidden="true" />
              New service
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard href="/admin/services" icon={Sparkles} label="Services" value={published(all.services)} detail={`${all.services.length} total · ${all.services.length - published(all.services)} drafts`} />
        <StatCard href="/admin/fleet" icon={CarFront} label="Vehicle classes" value={published(all.vehicles)} detail={`${all.vehicles.length} total`} />
        <StatCard href="/admin/cities" icon={MapPin} label="Cities" value={published(all.cities)} detail={`${all.cities.length} total`} />
        <StatCard href="/admin/settings" icon={MessageSquareQuote} label="Testimonials" value={liveTestimonials} detail={`${all.settings.testimonials.length} total`} />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader
            title="Needs attention"
            description={issues.length ? `${issues.length} ${issues.length === 1 ? "item" : "items"} to review` : undefined}
          />
          {issues.length === 0 ? (
            <div className="flex items-center gap-3 px-5 py-6 text-sm">
              <CheckCircle2 aria-hidden="true" className="size-5 text-success" />
              Everything is published and fully translated.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {issues.slice(0, 8).map((issue) => (
                <li key={issue.text}>
                  <Link href={issue.href} className="group flex items-center gap-3 px-5 py-3 text-sm hover:bg-surface-muted/50">
                    <AlertCircle aria-hidden="true" className="size-4 shrink-0 text-warning" />
                    <span className="flex-1">{issue.text}</span>
                    <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Translations" description="All website text, per language." />
          <CardBody className="gap-4">
            {LOCALES.map((locale) => {
              const done = percent(coverage[locale]);
              return (
                <div key={locale} className="grid gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold" lang={locale}>
                      <Languages aria-hidden="true" className="size-3.5 text-muted-foreground" />
                      {LOCALE_LABELS[locale]}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">{done}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                    <div className={cn("h-full rounded-full", done === 100 ? "bg-success" : "bg-warning")} style={{ width: `${done}%` }} />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recently updated" />
          <ul className="divide-y divide-border">
            {recent.map(({ name, href, kind, icon: Icon, updatedAt }) => (
              <li key={href}>
                <Link href={href} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-muted/50">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-muted text-muted-foreground">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{name}</span>
                    <span className="block text-xs text-muted-foreground">{kind}</span>
                  </span>
                  <span className="text-xs whitespace-nowrap text-muted-foreground">{formatRelative(updatedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Quick actions" />
          <CardBody className="gap-2">
            {[
              { href: "/admin/services/new", label: "Add a service", icon: Sparkles },
              { href: "/admin/fleet/new", label: "Add a vehicle class", icon: CarFront },
              { href: "/admin/cities/new", label: "Add a city", icon: MapPin },
              { href: "/admin/settings", label: "Update contact details", icon: Settings },
            ].map(({ href, label, icon: Icon }) => (
              <Button key={href} variant="secondary" className="justify-start" asChild>
                <Link href={href}>
                  <Icon aria-hidden="true" />
                  {label}
                </Link>
              </Button>
            ))}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
