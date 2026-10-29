"use client";

import { useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { Field } from "@/admin/components/ui/field";
import { cn } from "@/admin/lib/cn";
import type { City, PriceUnit, ServicePrice, Vehicle } from "@/admin/lib/content/types";
import type { ServiceFormValues } from "./service-schema";

const UNIT_OPTIONS: { value: PriceUnit; label: string; hint: string }[] = [
  { value: "trip", label: "Per journey", hint: "One price for the whole trip" },
  { value: "hour", label: "Per hour", hint: "Multiplied by the hours booked" },
];

function UnitPicker() {
  const { control } = useFormContext<ServiceFormValues>();
  const { field } = useController({ control, name: "priceUnit" });
  return (
    <Field label="Prices are">
      <div role="radiogroup" aria-label="Prices are" className="grid gap-2 sm:grid-cols-2">
        {UNIT_OPTIONS.map((option) => {
          const selected = field.value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => field.onChange(option.value)}
              className={cn(
                "cursor-pointer rounded-lg border px-3 py-2 text-start transition-colors",
                selected ? "border-primary bg-primary-soft" : "border-border bg-surface hover:border-primary/40",
              )}
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className="block text-xs text-muted-foreground">{option.hint}</span>
            </button>
          );
        })}
      </div>
    </Field>
  );
}

function parseAmount(text: string) {
  const normalized = text.trim().replace(",", ".");
  return normalized === "" ? null : Number(normalized);
}

function PriceCell({
  amount,
  label,
  error,
  onChange,
}: {
  amount: number | null;
  label: string;
  error?: string;
  onChange: (amount: number | null) => void;
}) {
  const [text, setText] = useState(amount === null ? "" : String(amount));
  const [shown, setShown] = useState(amount);
  // Follow outside changes (discard, save) without clobbering what is being typed.
  if (amount !== shown) {
    setShown(amount);
    if (parseAmount(text) !== amount) setText(amount === null ? "" : String(amount));
  }

  return (
    <div className="grid gap-1">
      <div className="relative">
        <span aria-hidden="true" className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          €
        </span>
        <input
          type="text"
          inputMode="decimal"
          aria-label={label}
          aria-invalid={error ? true : undefined}
          placeholder="—"
          value={text}
          onChange={(event) => {
            const next = event.target.value;
            if (!/^\d*(?:[.,]\d{0,2})?$/.test(next.trim())) return;
            setText(next);
            const parsed = parseAmount(next);
            setShown(parsed);
            onChange(parsed);
          }}
          className={cn(
            "h-9 w-full min-w-24 rounded-md border bg-surface ps-6 pe-2 text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring",
            error ? "border-danger" : "border-input",
          )}
        />
      </div>
      {error && (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Guide prices in euros for every city and vehicle class. The website shows the
 * lowest as "From €X" and the quote form shows the one for the chosen car and city.
 */
export function ServicePrices({
  serviceId,
  cities,
  vehicles,
}: {
  serviceId?: string;
  cities: City[];
  vehicles: Vehicle[];
}) {
  const { control, getFieldState, formState, watch } = useFormContext<ServiceFormValues>();
  const { field } = useController({ control, name: "prices" });
  const prices = field.value as ServicePrice[];
  const unit = watch("priceUnit");

  const indexOf = (cityId: string, vehicleId: string) =>
    prices.findIndex((price) => price.cityId === cityId && price.vehicleId === vehicleId);

  function setPrice(cityId: string, vehicleId: string, amount: number | null) {
    const others = prices.filter((price) => !(price.cityId === cityId && price.vehicleId === vehicleId));
    field.onChange(amount === null ? others : [...others, { cityId, vehicleId, amount }]);
  }

  if (cities.length === 0 || vehicles.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">
        Add at least one city and one vehicle class to set prices.
      </p>
    );
  }

  return (
    <div className="grid gap-5">
      <UnitPicker />

      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full border-separate border-spacing-x-2 border-spacing-y-2 text-sm">
          <caption className="sr-only">Guide prices in euros {unit === "hour" ? "per hour" : "per journey"}</caption>
          <thead>
            <tr>
              <th scope="col" className="text-start text-xs font-semibold text-muted-foreground">
                City
              </th>
              {vehicles.map((vehicle) => (
                <th key={vehicle.id} scope="col" className="text-start text-xs font-semibold text-muted-foreground">
                  {vehicle.name.en}
                  {vehicle.status === "draft" && <span className="font-normal"> · draft</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cities.map((city) => {
              const notOffered = serviceId !== undefined && !city.serviceIds.includes(serviceId);
              return (
                <tr key={city.id}>
                  <th scope="row" className="pe-2 text-start align-top font-semibold whitespace-nowrap">
                    <span className="block pt-2">{city.name.en}</span>
                    {(notOffered || city.status === "draft") && (
                      <span className="block text-xs font-normal text-muted-foreground">
                        {notOffered ? "Service not offered here" : "Draft"}
                      </span>
                    )}
                  </th>
                  {vehicles.map((vehicle) => {
                    const index = indexOf(city.id, vehicle.id);
                    return (
                      <td key={vehicle.id} className="align-top">
                        <PriceCell
                          amount={index === -1 ? null : prices[index].amount}
                          label={`${vehicle.name.en} in ${city.name.en}, euros ${unit === "hour" ? "per hour" : "per journey"}`}
                          error={index === -1 ? undefined : getFieldState(`prices.${index}.amount`, formState).error?.message}
                          onChange={(amount) => setPrice(city.id, vehicle.id, amount)}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
